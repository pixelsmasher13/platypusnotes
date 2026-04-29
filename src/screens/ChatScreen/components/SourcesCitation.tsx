import { type FC, useState } from "react";
import styled from "styled-components";
import { Collapse, Tooltip } from "@chakra-ui/react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { invoke } from "@tauri-apps/api/tauri";
import type { ChunkSource } from "../types";
import { SourceModal } from "./SourceModal";

const SourcesContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
`;

const SourcesHeader = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--text-secondary, #888);
  font-size: 12px;
  cursor: pointer;
  padding: 4px 0;

  &:hover {
    color: var(--text-primary, #fff);
  }
`;

const SourcesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const SourceChip = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--button-secondary-bg, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: 6px;
  padding: 6px 10px;
  color: var(--text-secondary, #aaa);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  max-width: 240px;

  &:hover {
    background: var(--button-secondary-hover-bg, rgba(255, 255, 255, 0.1));
    border-color: var(--accent-color, #6366f1);
    color: var(--text-primary, #fff);
  }
`;

const SourceIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: var(--accent-color, #6366f1);
  color: white;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
`;

const SourceName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PassageBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent-color, #6366f1);
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
`;

export type DocumentGroup = {
  document_id: number;
  document_name: string;
  chunks: ChunkSource[];
};

// Group sources by document, preserving the order of first appearance.
// Within each group, chunks are sorted by chunk_index so the user can read them in document order.
function groupByDocument(sources: ChunkSource[]): DocumentGroup[] {
  const map = new Map<number, DocumentGroup>();
  for (const source of sources) {
    let group = map.get(source.document_id);
    if (!group) {
      group = {
        document_id: source.document_id,
        document_name: source.document_name,
        chunks: [],
      };
      map.set(source.document_id, group);
    }
    group.chunks.push(source);
  }
  for (const group of map.values()) {
    group.chunks.sort((a, b) => a.chunk_index - b.chunk_index);
  }
  return Array.from(map.values());
}

type SourcesCitationProps = {
  sources: ChunkSource[];
  onOpenDocument?: (documentId: number) => void;
};

export const SourcesCitation: FC<SourcesCitationProps> = ({ sources, onOpenDocument }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<DocumentGroup | null>(null);
  const [selectedChunk, setSelectedChunk] = useState<ChunkSource | null>(null);
  const [fullChunkText, setFullChunkText] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const groups = groupByDocument(sources);

  if (groups.length === 0) {
    return null;
  }

  const fetchChunkText = async (chunkId: number) => {
    setFullChunkText(undefined);
    try {
      const text = await invoke<string | null>("get_chunk_text", { chunkId });
      if (text) {
        setFullChunkText(text);
      }
    } catch (error) {
      console.error("Failed to fetch passage text:", error);
    }
  };

  const handleGroupClick = (group: DocumentGroup) => {
    setSelectedGroup(group);
    const firstChunk = group.chunks[0];
    setSelectedChunk(firstChunk);
    setIsModalOpen(true);
    fetchChunkText(firstChunk.chunk_id);
  };

  const handleSelectSibling = (chunk: ChunkSource) => {
    setSelectedChunk(chunk);
    fetchChunkText(chunk.chunk_id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
    setSelectedChunk(null);
    setFullChunkText(undefined);
  };

  return (
    <SourcesContainer>
      <SourcesHeader onClick={() => setIsExpanded(!isExpanded)}>
        <FileText size={14} />
        <span>{groups.length} source{groups.length !== 1 ? 's' : ''}</span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </SourcesHeader>

      <Collapse in={isExpanded} animateOpacity>
        <SourcesList>
          {groups.map((group, index) => (
            <Tooltip
              key={group.document_id}
              label={
                group.chunks.length > 1
                  ? `${group.document_name} — ${group.chunks.length} passages`
                  : group.document_name
              }
              placement="top"
              hasArrow
            >
              <SourceChip onClick={() => handleGroupClick(group)}>
                <SourceIcon>{index + 1}</SourceIcon>
                <SourceName>{group.document_name}</SourceName>
                {group.chunks.length > 1 && (
                  <PassageBadge>{group.chunks.length}</PassageBadge>
                )}
              </SourceChip>
            </Tooltip>
          ))}
        </SourcesList>
      </Collapse>

      <SourceModal
        isOpen={isModalOpen}
        source={selectedChunk}
        siblings={selectedGroup?.chunks ?? []}
        fullText={fullChunkText}
        onClose={handleCloseModal}
        onSelectSibling={handleSelectSibling}
        onOpenDocument={onOpenDocument}
      />
    </SourcesContainer>
  );
};
