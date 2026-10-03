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
import { getCharacterAvatar } from '../data/avatarPresets';
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

  // Dynamic font size calculator for node names
  const getLabelFontSize = useCallback((name: string, tier: string) => {
    const len = name.length;
    const base = tier === 'lead' ? 13 : tier === 'supporting' ? 11 : 10;
    if (len > 18) return `${Math.max(8, base - 3)}px`;
    if (len > 12) return `${Math.max(9, base - 1.5)}px`;
    return `${base}px`;
  }, []);

  // Node radius based on tier
  const getNodeRadius = useCallback((tier: string) => {
    switch (tier) {
      case 'lead':
        return 34;
      case 'supporting':
        return 26;
      case 'minor':
      default:
        return 20;
    }
  }, []);

  // Prepare nodes and links with concentric ring calculations
  const { graphNodes, graphLinks } = useMemo(() => {
    // Degree counter
    const degreeMap = new Map<string, number>();
    relationships.forEach(r => {
      degreeMap.set(r.sourceId, (degreeMap.get(r.sourceId) || 0) + 1);
      degreeMap.set(r.targetId, (degreeMap.get(r.targetId) || 0) + 1);
    });

    const nodes: GraphNode[] = characters.map(c => {
      const prevPos = nodePositionsRef.current.get(c.id);
      const radius = getNodeRadius(c.tier);
      const degree = degreeMap.get(c.id) || 0;

      let concentricRing = 3;
      if (selectedCharacterId) {
        if (c.id === selectedCharacterId) {
          concentricRing = 0;
        } else {
          const directRel = relationships.find(
            r =>
              (r.sourceId === selectedCharacterId && r.targetId === c.id) ||
              (r.targetId === selectedCharacterId && r.sourceId === c.id)
          );
          if (directRel) {
            concentricRing = directRel.tier === 'primary' ? 1 : 2;
          }
        }
      }

      return {
        ...c,
        radius,
        degree,
        concentricRing,
        x: prevPos ? prevPos.x : (Math.random() - 0.5) * 400,
        y: prevPos ? prevPos.y : (Math.random() - 0.5) * 400,
      };
    });

    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    const links: GraphLink[] = relationships
      .filter(r => nodeMap.has(r.sourceId) && nodeMap.has(r.targetId))
      .map(r => ({
        ...r,
        source: nodeMap.get(r.sourceId)!,
        target: nodeMap.get(r.targetId)!,
      }));

    return { graphNodes: nodes, graphLinks: links };
  }, [characters, relationships, selectedCharacterId, getNodeRadius]);

  // Setup Zoom & Pan
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 4])
      .on('zoom', event => {
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    return () => {
      svg.on('.zoom', null);
    };
  }, []);

  // Center / snap to view on initial load or layout switch
  const handleSnapToCenter = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(700)
      .ease(d3.easeCubicOut)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  }, []);

  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.scaleBy, 1.3);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.scaleBy, 0.77);
  }, []);

  // Direct fast DOM update on simulation tick
  const updateRender = useCallback(() => {
    for (const node of graphNodes) {
      const el = nodeElsRef.current.get(node.id);
      if (el) {
        el.setAttribute('transform', `translate(${node.x},${node.y})`);
      }
    }

    for (const link of graphLinks) {
      const el = edgeElsRef.current.get(link.id);
      if (el) {
        const sx = typeof link.source === 'object' ? (link.source as GraphNode).x : 0;
        const sy = typeof link.source === 'object' ? (link.source as GraphNode).y : 0;
        const tx = typeof link.target === 'object' ? (link.target as GraphNode).x : 0;
        const ty = typeof link.target === 'object' ? (link.target as GraphNode).y : 0;
        el.setAttribute('x1', String(sx));
        el.setAttribute('y1', String(sy));
        el.setAttribute('x2', String(tx));
        el.setAttribute('y2', String(ty));
      }
    }
  }, [graphNodes, graphLinks]);

  // Run Simulation or Concentric Positioning
  useEffect(() => {
    if (!isPhysicsActive) return;

    if (layoutMode === 'concentric' && selectedCharacterId) {
      // Concentric Radar layout: Selected in center, ring 1 (primary), ring 2 (secondary), ring 3 (outer)
      const ring1 = graphNodes.filter(n => n.concentricRing === 1);
      const ring2 = graphNodes.filter(n => n.concentricRing === 2);
      const ring3 = graphNodes.filter(n => n.concentricRing === 3);

      const r1 = relationshipLength * 0.9;
      const r2 = relationshipLength * 1.6;
      const r3 = relationshipLength * 2.3;

      const selectedNode = graphNodes.find(n => n.id === selectedCharacterId);
      if (selectedNode) {
        selectedNode.x = 0;
        selectedNode.y = 0;
        selectedNode.fx = 0;
        selectedNode.fy = 0;
        nodePositionsRef.current.set(selectedNode.id, { x: 0, y: 0 });
      }

      // Distribute nodes evenly on rings
      ring1.forEach((n, i) => {
        const angle = (i / Math.max(1, ring1.length)) * 2 * Math.PI - Math.PI / 2;
        n.x = r1 * Math.cos(angle);
        n.y = r1 * Math.sin(angle);
        nodePositionsRef.current.set(n.id, { x: n.x, y: n.y });
      });

      ring2.forEach((n, i) => {
        const angle = (i / Math.max(1, ring2.length)) * 2 * Math.PI - Math.PI / 4;
        n.x = r2 * Math.cos(angle);
        n.y = r2 * Math.sin(angle);
        nodePositionsRef.current.set(n.id, { x: n.x, y: n.y });
      });

      ring3.forEach((n, i) => {
        const angle = (i / Math.max(1, ring3.length)) * 2 * Math.PI;
        n.x = r3 * Math.cos(angle);
        n.y = r3 * Math.sin(angle);
        nodePositionsRef.current.set(n.id, { x: n.x, y: n.y });
      });

      updateRender();

      // Light collision force to smooth minor overlaps
      const sim = d3.forceSimulation<GraphNode, GraphLink>(graphNodes)
        .force('collision', d3.forceCollide<GraphNode>().radius(d => d.radius + 18))
        .alpha(0.3)
        .on('tick', () => {
          graphNodes.forEach(n => {
            nodePositionsRef.current.set(n.id, { x: n.x, y: n.y });
          });
          updateRender();
        });

      simulationRef.current = sim;
      return () => {
        sim.stop();
      };
    } else if (layoutMode === 'circular') {
      // Circular story wheel layout
      const count = graphNodes.length;
      const radius = relationshipLength * 1.8;
      graphNodes.forEach((n, i) => {
        const angle = (i / Math.max(1, count)) * 2 * Math.PI - Math.PI / 2;
        n.x = radius * Math.cos(angle);
        n.y = radius * Math.sin(angle);
        nodePositionsRef.current.set(n.id, { x: n.x, y: n.y });
      });
      updateRender();
    } else {
      // Organic D3 Force layout
      const sim = d3.forceSimulation<GraphNode, GraphLink>(graphNodes)
        .force(
          'link',
          d3.forceLink<GraphNode, GraphLink>(graphLinks)
            .id(d => (d as GraphNode).id)
            .distance(d => (d.tier === 'primary' ? relationshipLength * 0.8 : relationshipLength * 1.15))
        )
        .force('charge', d3.forceManyBody<GraphNode>().strength(d => (d.tier === 'lead' ? -550 : -380)))
        .force('center', d3.forceCenter(0, 0))
        .force('collision', d3.forceCollide<GraphNode>().radius(d => d.radius + 24))
        .alphaDecay(0.028)
        .on('tick', () => {
          graphNodes.forEach(n => {
            nodePositionsRef.current.set(n.id, { x: n.x, y: n.y });
          });
          updateRender();
        });

      simulationRef.current = sim;
      return () => {
        sim.stop();
      };
    }
  }, [graphNodes, graphLinks, relationshipLength, layoutMode, selectedCharacterId, isPhysicsActive, updateRender]);

  // Pointer Drag Handlers (replaces D3 drag to guarantee zero `d.id` errors)
  const handleNodePointerDown = (e: React.PointerEvent, node: GraphNode) => {
    e.stopPropagation();
    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }

    if (simulationRef.current) {
      simulationRef.current.alphaTarget(0.3).restart();
    }

    draggingRef.current = {
      nodeId: node.id,
      pointerId: e.pointerId,
      hasMoved: false,
      startX: e.clientX,
      startY: e.clientY,
    };

    node.fx = node.x;
    node.fy = node.y;
  };

  const handleSvgPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || !svgRef.current || !gRef.current) return;
    const { nodeId, startX, startY } = draggingRef.current;

    if (Math.hypot(e.clientX - startX, e.clientY - startY) > 3) {
      draggingRef.current.hasMoved = true;
    }

    const node = graphNodes.find(n => n.id === nodeId);
    if (!node) return;

    // Convert client coordinates to SVG transformed group coordinates
    const gMatrix = gRef.current.getScreenCTM();
    if (gMatrix) {
      const pt = svgRef.current.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const transformed = pt.matrixTransform(gMatrix.inverse());
      node.fx = transformed.x;
      node.fy = transformed.y;
      node.x = transformed.x;
      node.y = transformed.y;
      nodePositionsRef.current.set(node.id, { x: node.x, y: node.y });
      updateRender();
    }
  };

  const handleSvgPointerUp = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const { nodeId, hasMoved } = draggingRef.current;

    const node = graphNodes.find(n => n.id === nodeId);
    if (node && layoutMode !== 'concentric') {
      node.fx = null;
      node.fy = null;
    }

    if (simulationRef.current) {
      simulationRef.current.alphaTarget(0);
    }

    // If user clicked without dragging, select this character
    if (!hasMoved) {
      onSelectCharacter(nodeId);
    }

    draggingRef.current = null;
  };

  // Click on background clears selection
  const handleSvgClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'bg-rect') {
      onSelectCharacter(null);
    }
  };

  // Concentric radar guide radii
  const concentricRadii = useMemo(() => {
    if (layoutMode !== 'concentric') return [];
    return [
      relationshipLength * 0.9,
      relationshipLength * 1.6,
      relationshipLength * 2.3,
    ];
  }, [layoutMode, relationshipLength]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none overflow-hidden transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0f172a]' : 'bg-[#fafaf9]'
      }`}
      onClick={handleSvgClick}
    >
      {/* Top Left Floating Header & Controls matching StageAgent */}
      <div className="absolute top-4 left-5 z-20 flex flex-col gap-2.5 pointer-events-none">
        {/* StageAgent prominent counters header */}
        <div className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 drop-shadow-xs">
          <span>{characters.length}</span> characters, <span>{relationships.length}</span> relationships
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Day / Night Mode Button matching screenshot */}
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all shadow-sm ${
              isDarkMode
                ? 'bg-slate-800/90 text-amber-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Physics Play / Pause */}
          <button
            onClick={() => setIsPhysicsActive(!isPhysicsActive)}
            title={isPhysicsActive ? 'Pause physics simulation' : 'Resume physics simulation'}
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all shadow-sm ${
              isDarkMode
                ? 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isPhysicsActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Quick Snap to Center */}
          <button
            onClick={handleSnapToCenter}
            title="Snap graph to center"
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all shadow-sm ${
              isDarkMode
                ? 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Dynamic Spring Length Slider */}
          <div
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-sm ${
              isDarkMode
                ? 'bg-slate-800/90 border-slate-700 text-slate-300'
                : 'bg-white/90 border-slate-200 text-slate-700'
            }`}
          >
            <span className="text-xs font-medium whitespace-nowrap">Spacing</span>
            <input
              type="range"
              min="90"
              max="320"
              value={relationshipLength}
              onChange={e => onRelationshipLengthChange(Number(e.target.value))}
              className="w-20 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-violet-600"
              title="Adjust relationship edge spacing"
            />
          </div>
        </div>
      </div>

      {/* Top Right Floating Controls: Book Front Cover Drag & Drop Box + Clear Selection + Zoom Bar */}
      <div className="absolute top-4 right-5 z-20 flex items-start gap-3 pointer-events-auto">
        {selectedCharacterId && (
          <button
            onClick={() => onSelectCharacter(null)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border shadow-sm transition-all mt-1 ${
              isDarkMode
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Clear selection
          </button>
        )}

        {/* Book Front Cover Drag & Drop Box (matching user placement in Screenshot) */}
        <div
          onDragOver={handleCoverDragOver}
          onDragLeave={handleCoverDragLeave}
          onDrop={handleCoverDrop}
          onClick={() => {
            if (!coverImageUrl) {
              coverFileInputRef.current?.click();
            }
          }}
          className={`relative group w-24 sm:w-28 h-32 sm:h-38 rounded-xl border-2 transition-all flex flex-col items-center justify-center overflow-hidden shadow-lg backdrop-blur-md ${
            isCoverDragging
              ? 'border-violet-500 bg-violet-100/90 dark:bg-violet-950/90 scale-105 ring-4 ring-violet-500/40 shadow-xl'
              : coverImageUrl
              ? 'border-slate-300 dark:border-slate-700 bg-slate-900/10 hover:shadow-xl'
              : 'border-dashed border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 hover:border-violet-500 hover:bg-violet-50/40 dark:hover:bg-violet-950/30 cursor-pointer'
          }`}
          title={
            coverImageUrl
              ? `${bookTitle || 'Book'} Cover (Drop another image or click Replace)`
              : 'Drag and drop front cover image here, or click to browse'
          }
        >
          {coverImageUrl ? (
            <>
              <img
                src={coverImageUrl}
                alt={`${bookTitle || 'Book'} front cover`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1 text-white">
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    coverFileInputRef.current?.click();
                  }}
                  className="px-2 py-1 rounded-md bg-violet-600 hover:bg-violet-700 text-[10px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                  title="Replace book cover"
                >
                  <Upload className="w-3 h-3" />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    if (onUpdateCoverImage) onUpdateCoverImage(undefined);
                  }}
                  className="px-2 py-1 rounded-md bg-red-600 hover:bg-red-700 text-[10px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                  title="Remove book cover"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-center text-slate-500 dark:text-slate-400 select-none">
              <BookOpen
                className={`w-6 h-6 mb-1 ${
                  isCoverDragging
                    ? 'text-violet-600 dark:text-violet-400 scale-110'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-violet-500'
                } transition-all`}
              />
              <span className="text-[10px] font-bold leading-tight text-slate-800 dark:text-slate-200">
                {isCoverDragging ? 'Drop Image!' : 'Book Cover'}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                Drag & drop
              </span>
            </div>
          )}
        </div>

        {/* Hidden File Input for Front Cover */}
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

        {/* Vertical Zoom Controls Bar */}
        <div
          className={`flex flex-col gap-1 p-1 rounded-xl border backdrop-blur-md shadow-sm ${
            isDarkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-200'
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
          {/* Concentric Guide Rings in Radar Mode (exactly like the StageAgent screenshots!) */}
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

              // Outer Ring Color
              const ringColor =
                node.tier === 'lead'
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

      {/* Hover Quick Card Tooltip (matching the tooltip in the user's screenshot!) */}
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
            transform: 'translateY(-50%)',
          }}
        >
          <div className="font-bold text-sm leading-tight text-slate-900 dark:text-white">
            {hoveredCharacter.displayName}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="capitalize font-medium text-violet-600 dark:text-violet-400">
              {hoveredCharacter.tier}
            </span>
            <span aria-hidden="true">·</span>
            <span>{hoveredCharacter.gender}</span>
            <span aria-hidden="true">·</span>
            <span>{hoveredCharacter.ageGroup}</span>
          </div>
          {hoveredCharacter.archetypeTag && (
            <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 italic line-clamp-1">
              {hoveredCharacter.archetypeTag}
            </div>
          )}
        </div>
      )}

      {/* Hover Link Tooltip */}
      {hoveredLink && (
        <div
          className={`absolute pointer-events-none z-30 px-3 py-1.5 rounded-lg border shadow-lg backdrop-blur-md ${
            isDarkMode
              ? 'bg-slate-900/95 border-slate-700 text-slate-200'
              : 'bg-white/95 border-slate-200 text-slate-800'
          }`}
          style={{
            left: `${hoveredLink.x + 10}px`,
            top: `${hoveredLink.y - 10}px`,
          }}
        >
          <div className="text-xs font-semibold" style={{ color: RELATIONSHIP_CONFIGS[hoveredLink.link.type]?.color }}>
            {hoveredLink.link.customLabel || RELATIONSHIP_CONFIGS[hoveredLink.link.type]?.name}
          </div>
          {hoveredLink.link.notes && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-0.5">
              {hoveredLink.link.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
