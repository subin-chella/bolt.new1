import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import StepsList from "./StepsList";
import FileExplorer from "./FileExplorer";
import MonacoEditor from "./Editor/MonacoEditor";
import { PreviewPane } from "./Preview/PreviewPane";
import TabsContainer from "./Tabs/TabsContainer";
import { FileItem, StepType } from "../../types";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { Step } from "../../types";
import { parseXml } from "../../steps";
import { useWebContainer } from "../../hooks/useWebContainer";
import { FileNode } from '@webcontainer/api';

export default function WorkspacePage() {
  const location = useLocation();
  const { prompt } = location.state || {};
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});

  const [llmMessages, setLlmMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);

  const [steps, setSteps] = useState<Step[]>([]);

  const [files, setFiles] = useState<FileItem[]>([]);
  const webcontainer = useWebContainer();
  console.log("webcontainer state:", webcontainer);

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps
      .filter(({ status }) => status === "pending")
      .map((step) => {
        updateHappened = true;
        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
          let currentFileStructure = [...originalFiles]; // {}
          let finalAnswerRef = currentFileStructure;

          let currentFolder = "";
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            let currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              // final file
              let file = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                });
              } else {
                file.content = step.code;
              }
              setFileContents((prev) => ({
                ...prev,
                [currentFolderName || ""]: step.code || "",
              }));
            } else {
              /// in a folder
              let folder = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!folder) {
                // create the folder
                currentFileStructure.unshift({
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                });
              }

              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder
              )!.children!;
            }
          }
          originalFiles = finalAnswerRef;
        }
      });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps((steps) =>
        steps.map((s: Step) => {
          return {
            ...s,
            status: "completed",
          };
        })
      );
    }

    console.log(files);
  }, [steps, files]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};

      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === "folder") {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children
              ? Object.fromEntries(
                  file.children.map((child) => [
                    child.name,
                    processFile(child, false),
                  ])
                )
              : {},
          };
        } else if (file.type === "file") {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || "",
              },
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || "",
              },
            };
          }
        }

        return mountStructure[file.name];
      };

      // Process each top-level file/folder
      files.forEach((file) => processFile(file, true));

      return mountStructure;
    };

    const mountStructure = createMountStructure(files);

    // Mount the structure if WebContainer is available
    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
    console.log("WebContainer state1:", webcontainer);
  }, [files, webcontainer]);

  useEffect(() => {
    console.log("Init effect triggered");
    let isMounted = true; // Use a flag to prevent state updates on unmounted component

    async function init() {
      console.log("Init function started");

      try {
        const response = await axios.post(`${BACKEND_URL}/template`, {
          prompt: prompt.trim(),
        });

        if (!isMounted) return; // Check if component is still mounted

        console.log("Template response:", response.data);
        setTemplateSet(true);

        const { prompts, uiPrompts } = response.data;

        // Parse initial steps
        const initialSteps = parseXml(uiPrompts[0]).map((x: Step) => ({
          ...x,
          status: "pending" as const,
        }));

        if (!isMounted) return;
        setSteps(initialSteps);

        setLoading(true);
        const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
          messages: [...prompts, prompt].map((content) => ({
            role: "user",
            content,
          })),
        });

        if (!isMounted) return;
        setLoading(false);

        // Parse additional steps
        const additionalSteps = parseXml(stepsResponse.data.response).map(
          (x: Step) => ({
            ...x,
            status: "pending" as const,
          })
        );

        // Merge steps
        setSteps((prevSteps) => {
          const combinedSteps = [...prevSteps, ...additionalSteps];
          const uniqueStepsMap = new Map(
            combinedSteps.map((step) => [step.title, step])
          );
          return Array.from(uniqueStepsMap.values());
        });

        setLlmMessages(
          [...prompts, prompt].map((content) => ({
            role: "user",
            content,
          }))
        );

        setLlmMessages((x) => [
          ...x,
          { role: "assistant", content: stepsResponse.data.response },
        ]);
      } catch (error) {
        console.error("Initialization error:", error);
        setLoading(false);
      }
    }

    init();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileSelect = (file: FileItem) => {
    if (file.type === "file") {
      setSelectedFile(file.name);
    }
    setFileContents((prev) => ({
      ...prev,
      [file.name]: prev?.[file.name] || file.content || "",
    }));
  };

  const handleCodeChange = (value: string | undefined) => {
    if (selectedFile && value) {
      setFileContents((prev) => ({
        ...prev,
        [selectedFile]: value,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Generating Your Website</h1>
          <p className="text-gray-400">Prompt: {prompt}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <StepsList steps={steps} />
          </div>
          <div className="md:col-span-1">
            <FileExplorer files={files} onFileSelect={handleFileSelect} />
          </div>
          <div className="md:col-span-2 h-[calc(100vh-12rem)]">
            <TabsContainer activeTab={activeTab} onTabChange={setActiveTab}>
              {activeTab === "code" ? (
                selectedFile ? (
                  <MonacoEditor
                    key={selectedFile}
                    content={fileContents[selectedFile] || ""}
                    language={
                      selectedFile.endsWith(".tsx")
                        ? "typescript"
                        : "javascript"
                    }
                    onChange={handleCodeChange}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Select a file to edit
                  </div>
                )
              ) : webcontainer ? (
                <PreviewPane webContainer={webcontainer} files={files} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Initializing Preview...
                </div>
              )}
            </TabsContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
