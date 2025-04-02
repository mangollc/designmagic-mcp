import { z } from "zod";
import { BaseTool } from "../utils/base-tool.js";
import { twentyFirstClient } from "../utils/http-client.js";

const REFINE_UI_TOOL_NAME = "21st_magic_component_refiner";
const REFINE_UI_TOOL_DESCRIPTION = `
"Use this tool when the user requests to refine/improve current UI component with /ui or /21 commands, 
or when context is about improving, fixing, or refining UI for a small component or molecule (NOT for big pages).
This tool ONLY returns the refined version of that UI component based on user feedback."
`;

interface RefineUiResponse {
  text: string;
}

export class RefineUiTool extends BaseTool {
  name = REFINE_UI_TOOL_NAME;
  description = REFINE_UI_TOOL_DESCRIPTION;

  schema = z.object({
    userMessage: z.string().describe("Full user's message about UI refinement"),
    absolutePathToRefiningFile: z
      .string()
      .describe("Absolute path to the file that needs to be refined"),
    context: z
      .string()
      .describe(
        "What user asks to refactor specifically, hints related to current file/codebase"
      ),
  });

  async execute({
    userMessage,
    absolutePathToRefiningFile,
    context,
  }: z.infer<typeof this.schema>) {
    try {
      const { data } = await twentyFirstClient.post<RefineUiResponse>(
        "/api/refine-ui",
        {
          userMessage,
          fileContent: await this.getContentOfFile(absolutePathToRefiningFile),
          context,
        }
      );

      return {
        content: [
          {
            type: "text" as const,
            text: data.text,
          },
        ],
      };
    } catch (error) {
      console.error("Error executing tool", error);
      throw error;
    }
  }

  private async getContentOfFile(path: string): Promise<string> {
    try {
      const fs = await import("fs/promises");
      return await fs.readFile(path, "utf-8");
    } catch (error) {
      console.error(`Error reading file ${path}:`, error);
      return "";
    }
  }
}
