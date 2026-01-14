
import React, { useState, useEffect } from 'react';
import { OrgNode, Organization } from '../types.ts';

interface OrgChartProps {
  tree: OrgNode[];
  onUpdateOrgs: React.Dispatch<React.SetStateAction<Organization[]>>;
}

const OrgChart: React.FC<OrgChartProps> = ({ tree, onUpdateOrgs }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node: OrgNode, level: number = 0) => {
    const isExpanded = expanded[node.org_id] ?? true;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.org_id} className="ml-8 relative">
        {/* Horizontal line connector */}
        {level > 0 && (
          <div className="absolute -left-8 top-1/2 w-8 h-px bg-slate-300"></div>
        )}
        
        <div className={`mb-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm transition-all hover:shadow-md w-72 ${node.org_level === '본부' ? 'border-l-4 border-l-blue-600' : 'border-l-4 border-l-slate-400'}`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                {node.org_level}
              </span>
              <h4 className="text-sm font-bold text-slate-800 mt-1">{node.org_name}</h4>
            </div>
            {hasChildren && (
              <button 
                onClick={() => toggleExpand(node.org_id)}
                className="text-slate-400 hover:text-blue-600 p-1"
              >
                {isExpanded ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                )}
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-50 p-2 rounded">
              <p className="text-slate-400">책임자</p>
              <p className="font-semibold text-slate-700">{node.manager_name}</p>
            </div>
            <div className="bg-slate-50 p-2 rounded">
              <p className="text-slate-400">인원수</p>
              <p className="font-semibold text-slate-700">{node.metrics?.headcount?.total_headcount || 0}명</p>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end space-x-2">
            <button className="text-[10px] font-bold text-blue-600 hover:underline">상세보기</button>
            <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600">이동</button>
          </div>
        </div>

        {/* Vertical line connector to children */}
        {hasChildren && isExpanded && (
          <div className="absolute left-0 top-[100%] w-px bg-slate-300 h-full"></div>
        )}

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col">
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 min-h-[600px] overflow-x-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-800">조직 계층 구조</h3>
          <p className="text-sm text-slate-500">드래그 앤 드롭으로 조직 구조를 실시간으로 조정할 수 있습니다.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-blue-700 transition-colors">
            + 새 조직 추가
          </button>
          <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
            Excel 다운로드
          </button>
        </div>
      </div>
      
      <div className="flex py-4">
        {tree.map(rootNode => renderNode(rootNode))}
      </div>
    </div>
  );
};

export default OrgChart;
