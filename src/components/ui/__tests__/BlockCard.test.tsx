import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BlockCard } from "@/components/ui/BlockCard";

function renderBlockCardStyle(element: React.ReactElement) {
  const markup = renderToStaticMarkup(element);
  const styleMatch = markup.match(/style="([^"]+)"/);
  return styleMatch?.[1] ?? "";
}

describe("BlockCard", () => {
  it("can render a role-colored card with a uniform border", () => {
    const style = renderBlockCardStyle(
      <BlockCard text="Priority" roleColor="teal" roleBorder="uniform" />
    );

    expect(style).toContain("border-top:1px solid");
    expect(style).toContain("border-right:1px solid");
    expect(style).toContain("border-bottom:1px solid");
    expect(style).toContain("border-left:1px solid");
    expect(style).not.toContain("border-left:3px solid");
  });

  it("keeps the accent border as the default for scheduled blocks", () => {
    const style = renderBlockCardStyle(
      <BlockCard text="Scheduled" roleColor="teal" />
    );

    expect(style).toContain("border-left:3px solid");
  });
});
