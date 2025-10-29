import Card from "./Card";
import ToolboxIcon from "../../../public/images/icon-toolbox.svg";
import LineIcon from "../../../public/images/icon-line.svg";
import LettersIcon from "../../../public/images/icon-text.svg";
import SelectedText from "../../../public/images/icon-text-selection.svg";
import classes from "./index.module.css";

export default function AlgorithmSection(): JSX.Element {
  return (
    <section className="pt-25 px-5 md:px-15 flex flex-col space-y-5 md:space-y-12.5 relative z-10">
      <h2 className={classes.Caption}>全面的 CRDT 算法支持</h2>
      <Card
        icon={ToolboxIcon}
        caption="基础数据结构"
        text={
          <>
            支持用于有序集合的{" "}
            <code>
              <a href="/docs/tutorial/list">MovableList</a>
            </code>
            ，用于键值对的 LWW（最后写入获胜）{" "}
            <code>
              <a href="/docs/tutorial/map">Map</a>
            </code>
            ，用于层级数据的{" "}
            <code>
              <a href="/docs/tutorial/tree">MovableTree</a>
            </code>
            ，以及用于富文本操作的{" "}
            <code>
              <a href="/docs/tutorial/text">Text</a>
            </code>
            ，覆盖多样化的协作应用场景。
          </>
        }
      />
      <Card
        icon={SelectedText}
        caption="基于 Fugue 的文本/列表编辑"
        text={
          <>
            Loro 集成了{" "}
            <a
              href="https://arxiv.org/abs/2305.00583"
              target="_blank"
              rel="noreferrer"
            >
              Fugue
            </a>
            ，这是一种旨在合并并发文本或列表编辑时最大限度减少交错异常的全新 CRDT 算法。
          </>
        }
      />
      <Card
        icon={LettersIcon}
        caption="富文本 CRDT"
        text={
          <>
            Loro 管理的富文本 CRDT 擅长合并并发样式编辑，尽可能保留每位用户的原始意图。欢迎阅读我们的博客{"  "}
            <a
              href="/blog/loro-richtext"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Loro 的富文本 CRDT
            </a>
            ，了解更多信息。
          </>
        }
      />
      <Card
        icon={LineIcon}
        caption="可移动树的层级数据"
        text={
          <>
            对于需要目录式数据操作的应用，Loro 引入了{" "}
            <a
              className="underline italic"
              href="https://ieeexplore.ieee.org/document/9563274"
              target="_blank"
              rel="noreferrer"
            >
              A Highly-Available Move Operation for Replicated Trees
            </a>
            论文中的算法，使层级数据的移动与重组更为简单。
          </>
        }
      />
    </section>
  );
}
