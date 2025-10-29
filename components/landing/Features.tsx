import classes from "./Features.module.css";
import FollowOnGitHub from "./FollowOnGitHub";

export default function Features() {
  return (
    <section className="w-full px-5 md:px-15 pt-4 pb-20 md:pt-15 md:pb-15 relative z-10">
      <FollowOnGitHub className="visible md:hidden mb-10 mt-8" />
      <p className="text-center text-neutral-400 mb-8">
        Loro 是一个面向本地优先、实时协作的高性能 CRDT 库。
      </p>
      <main className="flex flex-col space-y-5 gap-0 md:space-y-0 md:grid md:grid-cols-2 md:grid-rows-2 md:gap-5 xl:grid-cols-4 xl:grid-rows-1">
        <article className={classes.Card}>
          <h3 className="text-base md:text-xl font-extrabold bg-blue-green bg-clip-text text-fill text-fill-transparent md:w-auto">
            高性能
          </h3>
          <p className="h-auto md:min-h-18 text-white/60 text-base font-medium leading-normal">
            针对内存、CPU 与加载速度进行优化，提供先进的性能原语。
          </p>
        </article>
        <article className={classes.Card}>
          <h3 className="text-base md:text-xl font-extrabold bg-blue-green bg-clip-text text-fill text-fill-transparent md:w-auto">
            丰富的 CRDT 类型支持
          </h3>
          <p className="h-auto md:min-h-18 text-white/60 text-base font-medium leading-normal">
            轻松将类 JSON 数据转换为可协作的数据类型。
          </p>
        </article>
        <article className={classes.Card}>
          <h3 className="text-base md:text-xl font-extrabold bg-blue-green bg-clip-text text-fill text-fill-transparent d:w-auto">
            实时协作与版本控制
          </h3>
          <p className="h-auto md:min-h-18 text-white/60 text-base font-medium leading-normal">
            像 Git 一样保留完整版本历史，即使在实时协作中也不例外。
          </p>
        </article>
        <article className={classes.Card}>
          <h3 className="text-base md:text-xl font-extrabold bg-blue-green bg-clip-text text-fill text-fill-transparent md:w-auto">
            简单直观的 API
          </h3>
          <p className="h-auto md:min-h-18 text-white/60 text-base font-medium leading-normal">
            以开发体验为核心设计。
          </p>
        </article>
      </main>
    </section>
  );
}
