目前的仓库是英文版仓库的翻译，请根据主仓库的英文版本的 diff 来更新当前的中文文档。

你可以通过下面的方式获取主仓库的变更：

```bash
cd loro-docs
git diff origin/main..HEAD > changes.diff
``` 

然后你可以根据 `changes.diff` 文件中的内容，找到需要更新的部分，并将其翻译成中文，更新到当前的中文文档中。

更新后请在 loro-docs 的 submodule 中进行 git pull 来合并最新主仓库文档更新，并随着你更新的文档一起进行 git commit。
