import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../store';
import { Idea } from '../types';
import * as d3 from 'd3';

const LinksTab: React.FC = () => {
  const { ideas, links } = useApp();
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current || ideas.length === 0) return;

    const width = wrapperRef.current.clientWidth;
    const height = wrapperRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Data prep
    const nodes = ideas.map(d => ({ ...d }));
    const edges = links.map(l => ({
      source: l.source_idea_id,
      target: l.target_idea_id,
      value: l.strength
    })).filter(l => 
      nodes.find(n => n.id === l.source) && nodes.find(n => n.id === l.target)
    );

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(edges).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40));

    const link = svg.append("g")
      .attr("stroke", "#3f3f46") // zinc-700
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(edges)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value) * 2);

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("g")
      .data(nodes)
      .join("g");

    // Node circles
    node.append("circle")
      .attr("r", 8)
      .attr("fill", "#2563eb") // blue-600
      .attr("stroke", "#18181b"); // zinc-950

    // Labels
    node.append("text")
      .attr("x", 12)
      .attr("y", 4)
      .text((d: any) => d.title.length > 15 ? d.title.substring(0,15) + '...' : d.title)
      .clone(true).lower()
      .attr("fill", "none")
      .attr("stroke", "#09090b")
      .attr("stroke-width", 3);

    node.select("text")
      .attr("fill", "#e4e4e7") // zinc-200
      .style("font-size", "10px")
      .style("font-family", "Inter");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [ideas, links]);

  if (ideas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <p>No connections yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 bg-zinc-950/80 absolute top-0 w-full z-10 pointer-events-none">
        <h2 className="text-2xl font-bold text-white">Neural Graph</h2>
        <p className="text-xs text-zinc-500">Auto-generated connections based on semantic similarity.</p>
      </div>
      <div ref={wrapperRef} className="flex-1 w-full h-full">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default LinksTab;
