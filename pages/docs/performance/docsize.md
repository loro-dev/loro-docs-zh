---
keywords: "loro, yjs, automerge, diamond-type, 基准测试, 文档大小, crdt"
description: "比较 Loro 与主流 CRDT 的文档大小"
---

# 文档体积

本基准使用 Automerge 论文数据集。

来源：https://github.com/automerge/automerge-perf/tree/master/edit-by-index

数据集包含：

- 182,315 次单字符插入
- 77,463 次单字符删除
- 总计 259,778 次操作
- 最终文档包含 104,852 个字符

下表首行表示未启用 `gc` 与 `compress` 的配置。

| 配置                 | loro-snapshot | loro-update | diamond-type | yrs    | automerge |
| -------------------- | ------------- | ----------- | ------------ | ------ | --------- |
| 默认（无选项）       | 273561        | 251352      | 281042       | 226973 | 292742    |
| gc                   | x             | x           | 203564       | 159921 | x         |
| compress             | 132459        | 105724      | 150723       | 91777  | 129062    |
| gc & compress        | x             | x           | 106242       | 71033  | x         |

> 表中 `x` 表示该配置暂不支持。

Loro 还支持具备 gc 能力的浅快照编码，通过裁剪历史来减小体积。详见[相关文档](/docs/tutorial/encoding)。
如果从最新版本开始裁剪，结果如下：

| 配置     | loro-shallow-snapshot |
| -------- | --------------------- |
| 默认     | 63352                 |
| compress | 54517                 |
