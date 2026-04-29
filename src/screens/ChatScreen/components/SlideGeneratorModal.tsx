import { type FC, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Flex,
  Box,
  Spinner,
  Text,
  Textarea,
  HStack,
  IconButton,
  useToast,
  Tag,
} from "@chakra-ui/react";
import { invoke } from "@tauri-apps/api/tauri";
import { save } from "@tauri-apps/api/dialog";
import { writeTextFile } from "@tauri-apps/api/fs";
import { Presentation, ChevronLeft, ChevronRight, Download, RefreshCw } from "lucide-react";

export type Slide = {
  title: string;
  bullets: string[];
  speaker_notes?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  plainText: string;
  provider: string;
  modelId?: string;
};

const SLIDE_COUNT_OPTIONS = [5, 8, 10, 15];

export const SlideGeneratorModal: FC<Props> = ({
  isOpen,
  onClose,
  plainText,
  provider,
  modelId,
}) => {
  const toast = useToast();
  const [focus, setFocus] = useState("");
  const [slideCount, setSlideCount] = useState<number>(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const reset = () => {
    setSlides(null);
    setCurrentSlide(0);
    setFocus("");
    setSlideCount(8);
  };

  const handleClose = () => {
    if (!isGenerating) {
      reset();
      onClose();
    }
  };

  const handleGenerate = async () => {
    if (!plainText.trim()) {
      toast({
        title: "Nothing to generate from",
        description: "This note is empty.",
        status: "warning",
        duration: 3000,
        position: "bottom-right",
      });
      return;
    }

    setIsGenerating(true);
    setSlides(null);
    try {
      const result = await invoke<Slide[]>("generate_slides_from_document", {
        plainText,
        provider,
        modelId,
        focus: focus.trim() || null,
        slideCount,
      });
      setSlides(result);
      setCurrentSlide(0);
    } catch (error: any) {
      console.error("Slide generation failed:", error);
      toast({
        title: "Couldn't generate slides",
        description: error?.toString() || "An unexpected error occurred.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportMarkdown = async () => {
    if (!slides) return;
    const md = slides
      .map((s, i) => {
        const heading = i === 0 ? `# ${s.title}` : `## ${s.title}`;
        const bullets = s.bullets.map((b) => `- ${b}`).join("\n");
        const notes = s.speaker_notes ? `\n\n> ${s.speaker_notes}` : "";
        return `${heading}\n\n${bullets}${notes}`;
      })
      .join("\n\n---\n\n");

    try {
      const filePath = await save({
        defaultPath: `slides-${Date.now()}.md`,
        filters: [{ name: "Markdown", extensions: ["md"] }],
      });
      if (filePath) {
        await writeTextFile(filePath, md);
        toast({
          title: "Slides exported",
          description: "Open in Marp, Slidev, or any Markdown deck tool.",
          status: "success",
          duration: 3000,
          position: "bottom-right",
        });
      }
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error?.toString() || "Could not save file.",
        status: "error",
        duration: 4000,
        position: "bottom-right",
      });
    }
  };

  const slide = slides?.[currentSlide];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex align="center" gap={2}>
            <Presentation size={18} />
            <Text>Generate slide deck</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton isDisabled={isGenerating} />

        <ModalBody>
          {!slides ? (
            // Input form
            <Flex direction="column" gap={4}>
              <Box>
                <Text fontSize="sm" fontWeight="500" mb={1}>
                  Focus or style{" "}
                  <Text as="span" color="gray.500" fontWeight="400">
                    (optional)
                  </Text>
                </Text>
                <Textarea
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="e.g., investor pitch, technical deep-dive, focus on action items"
                  size="sm"
                  rows={3}
                  isDisabled={isGenerating}
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="500" mb={2}>
                  Number of slides
                </Text>
                <HStack spacing={2}>
                  {SLIDE_COUNT_OPTIONS.map((n) => (
                    <Button
                      key={n}
                      size="sm"
                      variant={slideCount === n ? "solid" : "outline"}
                      colorScheme={slideCount === n ? "blue" : "gray"}
                      onClick={() => setSlideCount(n)}
                      isDisabled={isGenerating}
                      borderRadius="full"
                      minW="50px"
                    >
                      {n}
                    </Button>
                  ))}
                </HStack>
              </Box>

              {isGenerating && (
                <Flex align="center" gap={2} py={4} color="gray.600">
                  <Spinner size="sm" />
                  <Text fontSize="sm">Generating slides…</Text>
                </Flex>
              )}
            </Flex>
          ) : (
            // Slide preview
            <Flex direction="column" gap={3}>
              <Flex align="center" justify="space-between">
                <Tag colorScheme="blue" borderRadius="full">
                  Slide {currentSlide + 1} of {slides.length}
                </Tag>
                <HStack spacing={1}>
                  <IconButton
                    aria-label="Previous slide"
                    icon={<ChevronLeft size={16} />}
                    size="sm"
                    variant="ghost"
                    isDisabled={currentSlide === 0}
                    onClick={() => setCurrentSlide((i) => Math.max(0, i - 1))}
                  />
                  <IconButton
                    aria-label="Next slide"
                    icon={<ChevronRight size={16} />}
                    size="sm"
                    variant="ghost"
                    isDisabled={currentSlide === slides.length - 1}
                    onClick={() => setCurrentSlide((i) => Math.min(slides.length - 1, i + 1))}
                  />
                </HStack>
              </Flex>

              {slide && (
                <Box
                  p={6}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="gray.200"
                  bg="gray.50"
                  minH="280px"
                >
                  <Text fontSize="2xl" fontWeight="700" mb={4} color="gray.900">
                    {slide.title}
                  </Text>
                  <Box as="ul" pl={5}>
                    {slide.bullets.map((b, i) => (
                      <Box as="li" key={i} fontSize="md" color="gray.700" mb={1.5}>
                        {b}
                      </Box>
                    ))}
                  </Box>
                  {slide.speaker_notes && (
                    <Box mt={4} pt={3} borderTop="1px solid" borderTopColor="gray.200">
                      <Text fontSize="xs" color="gray.500" fontStyle="italic">
                        Speaker notes: {slide.speaker_notes}
                      </Text>
                    </Box>
                  )}
                </Box>
              )}

              <Flex gap={1} flexWrap="wrap" mt={1}>
                {slides.map((_, i) => (
                  <Button
                    key={i}
                    size="xs"
                    variant={i === currentSlide ? "solid" : "outline"}
                    colorScheme={i === currentSlide ? "blue" : "gray"}
                    onClick={() => setCurrentSlide(i)}
                    minW="28px"
                    px={1}
                  >
                    {i + 1}
                  </Button>
                ))}
              </Flex>
            </Flex>
          )}
        </ModalBody>

        <ModalFooter gap={2}>
          {!slides ? (
            <>
              <Button variant="ghost" onClick={handleClose} isDisabled={isGenerating}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleGenerate}
                isLoading={isGenerating}
                loadingText="Generating"
                leftIcon={<Presentation size={14} />}
              >
                Generate
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                leftIcon={<RefreshCw size={14} />}
                onClick={() => setSlides(null)}
              >
                Regenerate
              </Button>
              <Button
                colorScheme="blue"
                leftIcon={<Download size={14} />}
                onClick={handleExportMarkdown}
              >
                Export as Markdown
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
