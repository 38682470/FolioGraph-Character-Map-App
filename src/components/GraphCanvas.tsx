import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import {
  Character,
  Relationship,
  RelationshipCategory,
  RELATIONSHIP_CONFIGS,
  GraphNode,
  GraphLink,
  LayoutMode,
} from '../types';
import { getCharacterAvatar, COLOR_CIRCLE_PRESETS } from '../data/avatarPresets';
import { ZoomIn, ZoomOut, RotateCcw, Moon, Sun, Play, Pause, Compass, BookOpen, Upload, Trash2, Image as ImageIcon } from 'lucide-react';

interface GraphCanvasProps {
  characters: Character[];
  relationships: Relationship[];
  selectedCharacterId: string | null;
  onSelectCharacter: (id: string | null) => void;
  relationshipLength: number;
  onRelationshipLengthChange: (len: number) => void;
  layoutMode: LayoutMode;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  activeFilterType: RelationshipCategory | null;
  onFilterTypeToggle: (type: RelationshipCategory | null) => void;
  coverImageUrl?: string;
  onUpdateCoverImage?: (coverUrl: string | undefined) => void;
  bookTitle?: string;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  characters,
  relationships,
  selectedCharacterId,
  onSelectCharacter,
  relationshipLength,
  onRelationshipLengthChange,
  layoutMode,
  isDarkMode,
  onToggleDarkMode,
  activeFilterType,
  onFilterTypeToggle,
  coverImageUrl,
  onUpdateCoverImage,
  bookTitle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  // References to DOM elements for ultra-fast direct updates on simulation tick
  const nodeElsRef = useRef<Map<string, SVGGElement>>(new Map());
  const edgeElsRef = useRef<Map<string, SVGLineElement>>(new Map());

  const [hoveredCharacter, setHoveredCharacter] = useState<Character | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredLink, setHoveredLink] = useState<{ link: GraphLink; x: number; y: number } | null>(null);
  const [isPhysicsActive, setIsPhysicsActive] = useState<boolean>(true);

  // Book Front Cover drag-and-drop & file picker
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [isCoverDragging, setIsCoverDragging] = useState(false);

  const handleCoverFileProcess = useCallback((file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = event => {
      const dataUri = event.target?.result as string;
      if (dataUri && onUpdateCoverImage) {
        onUpdateCoverImage(dataUri);
      }
    };
    reader.readAsDataURL(file);
  }, [onUpdateCoverImage]);

  const handleCoverDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCoverDragging(true);
  }, []);

  const handleCoverDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCoverDragging(false);
  }, []);

  const handleCoverDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCoverDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleCoverFileProcess(file);
    }
  }, [handleCoverFileProcess]);

  // Dragging state tracking
  const draggingRef = useRef<{
    nodeId: string;
    pointerId: number;
    hasMoved: boolean;
    startX: number;
    startY: number;
  } | null>(null);

  // D3 force simulation ref
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const nodePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Connected node IDs when a character is selected
  const connectedIds = useMemo(() => {
    if (!selectedCharacterId) return null;
    const ids = new Set<string>([selectedCharacterId]);
    relationships.forEach(r => {
      if (r.sourceId === selectedCharacterId) ids.add(r.targetId);
      if (r.targetId === selectedCharacterId) ids.add(r.sourceId);
    });
    return ids;
  }, [selectedCharacterId, relationships]);

  // Prepare Nodes with Radius & Visual Hierarchy matching StageAgent reference
  const graphNodes = useMemo<GraphNode[]>(() => {
    return characters.map(c => {
      const isLead = c.tier === 'lead';
      const isSupporting = c.tier === 'supporting';
      const radius = isLead ? 36 : isSupporting ? 28 : 22;
      const savedPos = nodePositionsRef.current.get(c.id);

      return {
        ...c,
        radius,
        x: savedPos?.x ?? (c.x ?? 0),
        y: savedPos?.y ?? (c.y ?? 0),
        vx: 0,
        vy: 0,
      };
    });
  }, [characters]);

  // Prepare Links
  const graphLinks = useMemo<GraphLink[]>(() => {
    const nodeMap = new Map(graphNodes.map(n => [n.id, n]));
    return relationships
      .filter(r => nodeMap.has(r.sourceId) && nodeMap.has(r.targetId))
      .map(r => ({
        ...r,
        source: nodeMap.get(r.sourceId)!,
        target: nodeMap.get(r.targetId)!,
      }));
  }, [relationships, graphNodes]);

  // Concentric Radial Radii calculation
  const concentricRadii = useMemo(() => {
    return [
      relationshipLength * 0.75,
      relationshipLength * 1.5,
      relationshipLength * 2.25,
      relationshipLength * 3.0,
    ];
  }, [relationshipLength]);

  // Layout Placement Effect
  useEffect(() => {
    if (graphNodes.length === 0) return;

    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    if (layoutMode === 'concentric') {
      const centerNode = selectedCharacterId
        ? graphNodes.find(n => n.id === selectedCharacterId) || graphNodes[0]
        : graphNodes[0];

      const immediateNeighbors: GraphNode[] = [];
      const secondNeighbors: GraphNode[] = [];
      const outerNodes: GraphNode[] = [];

      const connectedToCenter = new Set<string>();
      relationships.forEach(r => {
        if (r.sourceId === centerNode.id) connectedToCenter.add(r.targetId);
        if (r.targetId === centerNode.id) connectedToCenter.add(r.sourceId);
      });

      graphNodes.forEach(node => {
        if (node.id === centerNode.id) return;
        if (connectedToCenter.has(node.id)) {
          immediateNeighbors.push(node);
        } else if (node.tier === 'supporting') {
          secondNeighbors.push(node);
        } else {
          outerNodes.push(node);
        }
      });

      centerNode.x = 0;
      centerNode.y = 0;
      nodePositionsRef.current.set(centerNode.id, { x: 0, y: 0 });

      const placeRing = (nodes: GraphNode[], radius: number, offsetAngle: number = 0) => {
        const step = (Math.PI * 2) / Math.max(nodes.length, 1);
        nodes.forEach((n, i) => {
          const angle = i * step + offsetAngle;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          n.x = x;
          n.y = y;
          nodePositionsRef.current.set(n.id, { x, y });
        });
      };

      placeRing(immediateNeighbors, concentricRadii[0], -Math.PI / 2);
      placeRing(secondNeighbors, concentricRadii[1], Math.PI / 6);
      placeRing(outerNodes, concentricRadii[2], -Math.PI / 4);

      nodeElsRef.current.forEach((el, id) => {
        const pos = nodePositionsRef.current.get(id);
        if (pos) el.setAttribute('transform', `translate(${pos.x},${pos.y})`);
      });

      edgeElsRef.current.forEach((el, id) => {
        const rel = relationships.find(r => r.id === id);
        if (!rel) return;
        const sPos = nodePositionsRef.current.get(rel.sourceId);
        const tPos = nodePositionsRef.current.get(rel.targetId);
        if (sPos && tPos) {
          el.setAttribute('x1', `${sPos.x}`);
          el.setAttribute('y1', `${sPos.y}`);
          el.setAttribute('x2', `${tPos.x}`);
          el.setAttribute('y2', `${tPos.y}`);
        }
      });
    } else if (layoutMode === 'circular') {
      const leadNodes = graphNodes.filter(n => n.tier === 'lead');
      const otherNodes = graphNodes.filter(n => n.tier !== 'lead');

      const innerRadius = relationshipLength * 0.9;
      const outerRadius = relationshipLength * 1.8;

      const placeCircle = (nodes: GraphNode[], radius: number) => {
        const step = (Math.PI * 2) / Math.max(nodes.length, 1);
        nodes.forEach((n, i) => {
          const angle = i * step - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          n.x = x;
          n.y = y;
          nodePositionsRef.current.set(n.id, { x, y });
        });
      };

      placeCircle(leadNodes, innerRadius);
      placeCircle(otherNodes, outerRadius);

      nodeElsRef.current.forEach((el, id) => {
        const pos = nodePositionsRef.current.get(id);
        if (pos) el.setAttribute('transform', `translate(${pos.x},${pos.y})`);
      });

      edgeElsRef.current.forEach((el, id) => {
        const rel = relationships.find(r => r.id === id);
        if (!rel) return;
        const sPos = nodePositionsRef.current.get(rel.sourceId);
        const tPos = nodePositionsRef.current.get(rel.targetId);
        if (sPos && tPos) {
          el.setAttribute('x1', `${sPos.x}`);
          el.setAttribute('y1', `${sPos.y}`);
          el.setAttribute('x2', `${tPos.x}`);
          el.setAttribute('y2', `${tPos.y}`);
        }
      });
    } else if (layoutMode === 'force') {
      const sim = d3
        .forceSimulation<GraphNode, GraphLink>(graphNodes)
        .force(
          'link',
          d3
            .forceLink<GraphNode, GraphLink>(graphLinks)
            .id(d => d.id)
            .distance(d => {
              if (d.tier === 'primary') return relationshipLength;
              if (d.tier === 'secondary') return relationshipLength * 1.3;
              return relationshipLength * 1.6;
            })
            .strength(0.6)
        )
        .force('charge', d3.forceManyBody().strength(-450))
        .force('collision', d3.forceCollide<GraphNode>().radius(d => d.radius + 18))
        .force('center', d3.forceCenter(0, 0).strength(0.05))
        .alpha(isPhysicsActive ? 0.8 : 0)
        .alphaDecay(0.028);

      sim.on('tick', () => {
        nodeElsRef.current.forEach((el, id) => {
          const node = graphNodes.find(n => n.id === id);
          if (node && node.x !== undefined && node.y !== undefined) {
            el.setAttribute('transform', `translate(${node.x},${node.y})`);
            nodePositionsRef.current.set(id, { x: node.x, y: node.y });
          }
        });

        edgeElsRef.current.forEach((el, id) => {
          const link = graphLinks.find(l => l.id === id);
          if (!link) return;
          const s = link.source as GraphNode;
          const t = link.target as GraphNode;
          if (s?.x !== undefined && s?.y !== undefined && t?.x !== undefined && t?.y !== undefined) {
            el.setAttribute('x1', `${s.x}`);
            el.setAttribute('y1', `${s.y}`);
            el.setAttribute('x2', `${t.x}`);
            el.setAttribute('y2', `${t.y}`);
          }
        });
      });

      simulationRef.current = sim;
    }

    return () => {
      if (simulationRef.current) simulationRef.current.stop();
    };
  }, [layoutMode, graphNodes, graphLinks, relationshipLength, selectedCharacterId, relationships, concentricRadii, isPhysicsActive]);

  // Zoom / Pan setup using D3
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4.0])
      .on('zoom', event => {
        if (gRef.current) {
          d3.select(gRef.current).attr('transform', event.transform.toString());
        }
      });

    d3.select(svgRef.current).call(zoom).on('dblclick.zoom', null);
    zoomBehaviorRef.current = zoom;
  }, []);

  // Snap to center
  const handleSnapToCenter = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(600)
      .ease(d3.easeCubicOut)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  }, []);

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.25);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.8);
  };

  // Node Dragging Pointer Events
  const handleNodePointerDown = (e: React.PointerEvent<SVGGElement>, node: GraphNode) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    draggingRef.current = {
      nodeId: node.id,
      pointerId: e.pointerId,
      hasMoved: false,
      startX: e.clientX,
      startY: e.clientY,
    };

    if (simulationRef.current) {
      simulationRef.current.alphaTarget(0.3).restart();
      node.fx = node.x;
      node.fy = node.y;
    }
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;

    const drag = draggingRef.current;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (!drag.hasMoved && Math.hypot(dx, dy) > 4) {
      drag.hasMoved = true;
    }

    if (drag.hasMoved) {
      const node = graphNodes.find(n => n.id === drag.nodeId);
      if (!node || !svgRef.current || !gRef.current) return;

      const ctm = gRef.current.getScreenCTM();
      if (!ctm) return;

      const inv = ctm.inverse();
      const pt = svgRef.current.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const transformed = pt.matrixTransform(inv);

      node.x = transformed.x;
      node.y = transformed.y;
      if (simulationRef.current) {
        node.fx = transformed.x;
        node.fy = transformed.y;
      }
      nodePositionsRef.current.set(node.id, { x: node.x, y: node.y });

      const el = nodeElsRef.current.get(node.id);
      if (el) el.setAttribute('transform', `translate(${node.x},${node.y})`);

      edgeElsRef.current.forEach((edgeEl, linkId) => {
        const link = graphLinks.find(l => l.id === linkId);
        if (!link) return;
        const s = link.source as GraphNode;
        const t = link.target as GraphNode;
        if (s.id === node.id || t.id === node.id) {
          const sPos = nodePositionsRef.current.get(s.id);
          const tPos = nodePositionsRef.current.get(t.id);
          if (sPos && tPos) {
            edgeEl.setAttribute('x1', `${sPos.x}`);
            edgeEl.setAttribute('y1', `${sPos.y}`);
            edgeEl.setAttribute('x2', `${tPos.x}`);
            edgeEl.setAttribute('y2', `${tPos.y}`);
          }
        }
      });
    }
  };

  const handleSvgPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;

    const drag = draggingRef.current;
    if (!drag.hasMoved) {
      onSelectCharacter(drag.nodeId === selectedCharacterId ? null : drag.nodeId);
    }

    if (simulationRef.current) {
      simulationRef.current.alphaTarget(0);
      const node = graphNodes.find(n => n.id === drag.nodeId);
      if (node) {
        node.fx = null;
        node.fy = null;
      }
    }

    draggingRef.current = null;
  };

  const getLabelFontSize = (name: string, tier: string): string => {
    const isLead = tier === 'lead';
    const isSupporting = tier === 'supporting';
    if (isLead) return name.length > 14 ? '13px' : '15px';
    if (isSupporting) return name.length > 14 ? '11px' : '12px';
    return '10px';
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden select-none transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Interactive Book Cover Watermark (Top-Left) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <div
          onDragOver={handleCoverDragOver}
          onDragLeave={handleCoverDragLeave}
          onDrop={handleCoverDrop}
          onClick={() => coverFileInputRef.current?.click()}
          title="Click or drag-and-drop an image to update the book's front cover"
          className={`group relative rounded-xl overflow-hidden cursor-pointer shadow-lg border transition-all ${
            isCoverDragging
              ? 'ring-4 ring-violet-500 scale-105 border-violet-500'
              : isDarkMode
              ? 'border-slate-800 bg-slate-900 hover:border-violet-500'
              : 'border-slate-200 bg-white hover:border-violet-500'
          }`}
        >
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={bookTitle || 'Novel Cover'}
              className="w-12 h-16 sm:w-14 sm:h-20 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-12 h-16 sm:w-14 sm:h-20 flex flex-col items-center justify-center p-1.5 text-center text-slate-400 dark:text-slate-500 group-hover:text-violet-500">
              <BookOpen className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-bold leading-tight">Add Cover</span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload className="w-4 h-4 text-white drop-shadow" />
          </div>

          <input
            ref={coverFileInputRef}
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleCoverFileProcess(file);
            }}
            className="hidden"
          />
        </div>

        {bookTitle && (
          <div className="hidden sm:block">
            <h1 className="font-serif font-extrabold text-base lg:text-lg tracking-tight leading-none text-slate-900 dark:text-white drop-shadow-xs">
              {bookTitle}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Interactive Literary Character Web
            </p>
          </div>
        )}
      </div>

      {/* Floating Canvas Controls (Top-Right) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Relationship Distance Slider */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-sm text-xs font-medium ${
            isDarkMode
              ? 'bg-slate-900/90 border-slate-800 text-slate-200'
              : 'bg-white/90 border-slate-200 text-slate-700'
          }`}
        >
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            Distance
          </span>
          <input
            type="range"
            min={100}
            max={280}
            step={10}
            value={relationshipLength}
            onChange={e => onRelationshipLengthChange(Number(e.target.value))}
            className="w-20 sm:w-28 accent-violet-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
          />
        </div>

        {/* Force Mode Physics Freeze/Resume Toggle */}
        {layoutMode === 'force' && (
          <button
            onClick={() => setIsPhysicsActive(!isPhysicsActive)}
            title={isPhysicsActive ? 'Freeze physics simulation' : 'Resume live physics'}
            className={`p-2 rounded-xl border backdrop-blur-md shadow-sm transition-colors ${
              isPhysicsActive
                ? 'bg-violet-600 border-violet-600 text-white'
                : isDarkMode
                ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                : 'bg-white/90 border-slate-200 text-slate-700'
            }`}
          >
            {isPhysicsActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`p-2 rounded-xl border backdrop-blur-md shadow-sm transition-colors ${
            isDarkMode
              ? 'bg-slate-900/90 border-slate-800 text-amber-400 hover:bg-slate-800'
              : 'bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Zoom In, Out & Reset */}
        <div
          className={`flex items-center rounded-xl border backdrop-blur-md shadow-sm p-0.5 ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}
        >
          <button
            onClick={handleZoomIn}
            title="Zoom in"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom out"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleSnapToCenter}
            title="Reset zoom"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Relationship Types Legend (Bottom-Left) matching user's screenshot! */}
      <div
        className={`absolute bottom-5 left-5 z-20 p-3.5 rounded-2xl border backdrop-blur-md shadow-lg transition-all max-w-[210px] ${
          isDarkMode
            ? 'bg-slate-900/95 border-slate-800 text-slate-200'
            : 'bg-white/95 border-slate-200/90 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Relationship Types
          </span>
          {activeFilterType && (
            <button
              onClick={() => onFilterTypeToggle(null)}
              className="text-[10px] text-violet-600 dark:text-violet-400 hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {(Object.keys(RELATIONSHIP_CONFIGS) as RelationshipCategory[]).map(catKey => {
            const config = RELATIONSHIP_CONFIGS[catKey];
            const isFiltered = activeFilterType === catKey;
            return (
              <button
                key={catKey}
                onClick={() => onFilterTypeToggle(isFiltered ? null : catKey)}
                className={`w-full flex items-center justify-between text-left px-2 py-1 rounded-lg text-xs transition-colors ${
                  isFiltered
                    ? 'bg-violet-50 dark:bg-violet-950/60 ring-1 ring-violet-500 font-semibold text-violet-900 dark:text-violet-200'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-1.5 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <span>{config.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main SVG Graph */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        viewBox="-700 -450 1400 900"
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleSvgPointerUp}
      >
        {/* Background Click Receptor */}
        <rect id="bg-rect" x="-2000" y="-2000" width="4000" height="4000" fill="transparent" />

        <g ref={gRef}>
          {/* Concentric Guide Rings in Radar Mode */}
          {layoutMode === 'concentric' && (
            <g className="concentric-rings pointer-events-none">
              {concentricRadii.map((r, idx) => (
                <circle
                  key={idx}
                  cx="0"
                  cy="0"
                  r={r}
                  fill="none"
                  stroke={isDarkMode ? 'rgba(148, 163, 184, 0.16)' : 'rgba(148, 163, 184, 0.25)'}
                  strokeWidth="1.5"
                  strokeDasharray="5,6"
                />
              ))}
            </g>
          )}

          {/* Links / Edges */}
          <g className="graph-links-layer">
            {graphLinks.map(link => {
              const sourceNode = typeof link.source === 'object' ? (link.source as GraphNode) : null;
              const targetNode = typeof link.target === 'object' ? (link.target as GraphNode) : null;
              if (!sourceNode || !targetNode) return null;

              const isDirectlyConnected =
                !selectedCharacterId ||
                sourceNode.id === selectedCharacterId ||
                targetNode.id === selectedCharacterId;

              const matchesFilter = !activeFilterType || link.type === activeFilterType;
              const isDimmed = !isDirectlyConnected || !matchesFilter;

              const color = RELATIONSHIP_CONFIGS[link.type]?.color || '#94a3b8';
              const strokeWidth = link.tier === 'primary' ? 2.8 : link.tier === 'secondary' ? 2 : 1.2;

              return (
                <line
                  key={link.id}
                  ref={el => {
                    if (el) edgeElsRef.current.set(link.id, el);
                    else edgeElsRef.current.delete(link.id);
                  }}
                  className="graph-edge transition-opacity duration-200"
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeOpacity={isDimmed ? 0.08 : 0.88}
                  strokeDasharray={link.type === 'authority' ? '4,3' : undefined}
                  onMouseEnter={e => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) {
                      setHoveredLink({
                        link,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }
                  }}
                  onMouseLeave={() => setHoveredLink(null)}
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g className="graph-nodes-layer">
            {graphNodes.map(node => {
              const isSelected = node.id === selectedCharacterId;
              const isConnected = !connectedIds || connectedIds.has(node.id);
              const isDimmed = !isConnected;

              // Outer Ring Color - adopts color circle if chosen, else tier color
              const ringColor =
                node.avatarPreset?.startsWith('color_')
                  ? COLOR_CIRCLE_PRESETS.find(p => p.id === node.avatarPreset)?.color || '#94a3b8'
                  : node.tier === 'lead'
                  ? '#8b5cf6'
                  : node.tier === 'supporting'
                  ? '#0ea5e9'
                  : isDarkMode
                  ? '#475569'
                  : '#94a3b8';

              const avatarSrc = getCharacterAvatar(node);
              const fontSize = getLabelFontSize(node.displayName, node.tier);

              return (
                <g
                  key={node.id}
                  ref={el => {
                    if (el) nodeElsRef.current.set(node.id, el);
                    else nodeElsRef.current.delete(node.id);
                  }}
                  className="graph-node-group cursor-pointer transition-opacity duration-200"
                  transform={`translate(${node.x},${node.y})`}
                  opacity={isDimmed ? 0.16 : 1}
                  onPointerDown={e => handleNodePointerDown(e, node)}
                  onMouseEnter={e => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) {
                      setHoveredCharacter(node);
                      setHoverPos({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredCharacter(null);
                    setHoverPos(null);
                  }}
                >
                  {/* Selection Glow Pulse */}
                  {isSelected && (
                    <circle
                      cx="0"
                      cy="0"
                      r={node.radius + 8}
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="3.5"
                      strokeDasharray="6,4"
                      className="animate-spin-slow opacity-80"
                    />
                  )}

                  {/* Outer Border Halo */}
                  <circle
                    cx="0"
                    cy="0"
                    r={node.radius + 2.5}
                    fill={isDarkMode ? '#1e293b' : '#ffffff'}
                    stroke={isSelected ? '#7c3aed' : ringColor}
                    strokeWidth={isSelected ? 4 : node.tier === 'lead' ? 3.5 : 2.5}
                    className="shadow-md"
                  />

                  {/* Circular Avatar Clip */}
                  <clipPath id={`clip-${node.id}`}>
                    <circle cx="0" cy="0" r={node.radius} />
                  </clipPath>

                  {/* Avatar Image / Vector */}
                  <image
                    href={avatarSrc}
                    x={-node.radius}
                    y={-node.radius}
                    width={node.radius * 2}
                    height={node.radius * 2}
                    clipPath={`url(#clip-${node.id})`}
                    preserveAspectRatio="xMidYMid slice"
                  />

                  {/* Character Name Label in lower area */}
                  <text
                    x="0"
                    y={node.radius + 15}
                    textAnchor="middle"
                    fill={isDarkMode ? '#f8fafc' : '#0f172a'}
                    fontSize={fontSize}
                    fontWeight={isSelected || node.tier === 'lead' ? '700' : '600'}
                    style={{
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      paintOrder: 'stroke fill',
                      stroke: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      strokeWidth: '3.5px',
                    }}
                  >
                    {node.displayName}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Hover Quick Card Tooltip */}
      {hoveredCharacter && hoverPos && (
        <div
          className={`absolute pointer-events-none z-30 px-3.5 py-2.5 rounded-xl border shadow-xl backdrop-blur-md transition-opacity duration-150 ${
            isDarkMode
              ? 'bg-slate-900/95 border-slate-700 text-slate-100'
              : 'bg-white/95 border-slate-200 text-slate-800'
          }`}
          style={{
            left: `${hoverPos.x + 18}px`,
            top: `${hoverPos.y - 12}px`,
            maxWidth: '240px',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2 h-2 rounded-full ${
                hoveredCharacter.tier === 'lead'
                  ? 'bg-violet-500'
                  : hoveredCharacter.tier === 'supporting'
                  ? 'bg-sky-500'
                  : 'bg-slate-400'
              }`}
            />
            <span className="font-bold text-xs truncate">{hoveredCharacter.fullName}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
            {hoveredCharacter.archetypeTag || hoveredCharacter.tier} · {hoveredCharacter.gender}
          </div>
          <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed">
            {hoveredCharacter.overviewBio}
          </p>
        </div>
      )}

      {/* Hover Relationship Tooltip */}
      {hoveredLink && (
        <div
          className={`absolute pointer-events-none z-30 px-3 py-2 rounded-xl border shadow-xl backdrop-blur-md text-xs ${
            isDarkMode
              ? 'bg-slate-900/95 border-slate-700 text-slate-100'
              : 'bg-white/95 border-slate-200 text-slate-800'
          }`}
          style={{
            left: `${hoveredLink.x + 14}px`,
            top: `${hoveredLink.y - 10}px`,
            maxWidth: '220px',
          }}
        >
          <div className="flex items-center gap-1.5 font-bold mb-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: RELATIONSHIP_CONFIGS[hoveredLink.link.type]?.color || '#94a3b8',
              }}
            />
            <span>{hoveredLink.link.customLabel || RELATIONSHIP_CONFIGS[hoveredLink.link.type]?.name}</span>
          </div>
          {hoveredLink.link.notes && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              {hoveredLink.link.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
