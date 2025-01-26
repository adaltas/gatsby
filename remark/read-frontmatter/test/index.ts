import "should";
import dedent from "dedent";
import { unified } from "unified";
import parseMarkdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";
import extractFrontmatter from "remark-frontmatter";
import pluginReadFrontmatter from "../src/index.js";

describe("Read frontmatter", function () {
  it("extract yaml", async function () {
    const { data } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ["yaml"])
      .use(pluginReadFrontmatter)
      .use(remark2rehype)
      .use(html).process(dedent`
        ---
        title: 'Article'
        lang: fr
        ---
      `);
    data.should.eql({ title: "Article", lang: "fr" });
  });

  it("extract toml", async function () {
    const { data } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ["toml"])
      .use(pluginReadFrontmatter)
      .use(remark2rehype)
      .use(html).process(dedent`
        +++
        title = 'Article'
        lang = 'fr'
        +++
      `);
    data.should.eql({ title: "Article", lang: "fr" });
  });

  it("option `property`", async function () {
    // type Data = { test?: Record<string, unknown> } & Record<string, unknown>;
    type Data = { test: Record<string, unknown> } & Record<string, unknown>;
    const {
      data,
    }: {
      data: Data;
    } = (await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ["yaml"])
      .use(pluginReadFrontmatter, { property: "test" })
      .use(remark2rehype)
      .use(html).process(dedent`
        ---
        title: 'Article'
        lang: fr
        ---
      `)) as unknown as { data: Data };
    // if (!data.test) throw Error("Property data.test is not defined.");
    data.test.should.eql({ title: "Article", lang: "fr" });
  });

  it("option `override` is `false` by default", async function () {
    const { data } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ["yaml"])
      .use(() => {
        return (tree, file) => {
          file.data = {
            overriden: "no",
          };
        };
      })
      .use(pluginReadFrontmatter)
      .use(remark2rehype)
      .use(html).process(dedent`
        ---
        title: Article
        lang: fr
        ---
      `);
    data.should.eql({ overriden: "no", title: "Article", lang: "fr" });
  });

  it("option `override` is `true`", async function () {
    const { data } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ["yaml"])
      .use(() => {
        return (tree, file) => {
          file.data = {
            overriden: "yes",
          };
        };
      })
      .use(pluginReadFrontmatter, { override: true })
      .use(remark2rehype)
      .use(html).process(dedent`
        ---
        title: Article
        lang: fr
        ---
      `);
    data.should.eql({ title: "Article", lang: "fr" });
  });
});
