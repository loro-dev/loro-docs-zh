---
keywords: "loro, yjs, automerge, 基准测试, 内存, crdt"
description: "CRDT 基准测试，用于比较 Loro 与主流 CRDT 的性能"
---

# JS/WASM 基准测试

> 这些基准测试的主要作用是提示是否存在性能隐患，而不是用来判定哪一个项目更优秀。不同项目始终会做出不同的取舍。仅因为项目 A 在某些基准中表现更好就断言它优于项目 B 并不准确，因为项目 B 很可能在其他方面有着显著优势。

可以通过 [crdt-benchmarks](https://github.com/https://twitter.com/zx_loro/crdt-benchmarks) 仓库复现这些测试。

- 基准测试在 MacBook Pro M1 2020（16GB RAM）上执行。
- `loro-old` 指 2023-11-10 的 loro 版本，编译自
  [这个提交](https://github.com/loro-dev/loro/tree/c1613ee680c6a4757e55fcda76e4f5f627daeb56)。
  从那以后 Loro 做了大量改动，尤其是
  [编码方案](https://github.com/loro-dev/loro/pull/219)。
  为了在 1.0 之后保持良好的前后向兼容性，我们改用了更易扩展的编码方式。
  它确实比 `loro-old` 使用的编码更慢，但能在不破坏兼容性的前提下更快迭代。
- 文末还有一个更全面的基准组，仅针对 Yjs。
- 如果所有变更都在一次 `change` 事务中提交，Automerge 可以在约 1 秒内完成 `B4` 基准（见 `time` 字段）。
  但为了更贴近真实用户行为，我们的测试会模拟逐条编辑，并让每次编辑都生成独立的更新事件。
- 当初始文档非空时（例如同步远端内容），`automerge` 与 `loro` 的 `parseTime` 会明显更高。
- Loro 和 Automerge 可以为每次按键保存完整的编辑历史 DAG；
  而 Yjs 若要为每个版本保存状态则需要额外存储版本向量与删除集合，这会带来超出文中统计的额外开销。

<details>
<summary>基准设置</summary>

#### B1：无冲突

模拟两个客户端。一方修改文本对象并将更新消息发送给另一方。我们统计执行任务的耗时（`time`）、通信数据量（`avgUpdateSize`）、任务结束后文档的编码大小（`docSize`）、解析编码文档的时间（`parseTime`），以及持有解码文档所需的内存（`memUsed`）。

#### B2：两个用户产生冲突

模拟两个客户端。双方从包含 100 个字符的同步文本对象开始，各自在单次事务中完成修改，再将变更发送给对端。我们统计将冲突变更合并到单个客户端的时间（`time`）、更新消息大小（`updateSize`）、任务结束后文档的编码大小（`docSize`）、解析编码文档的时间（`parseTime`），以及持有解码文档所需的内存（`memUsed`）。

#### B3：大量冲突

模拟 `√N` 个并发操作。我们统计执行任务并同步所有客户端的时间（`time`）、更新消息大小（`updateSize`）、任务结束后文档的编码大小（`docSize`）、解析编码文档的时间（`parseTime`），以及持有解码文档所需的内存（`memUsed`）。`√N` 的对数是因为 `√N` 个并发操作最多可能产生 `√N^2 - 1` 个冲突（执行操作 1：0 个冲突；执行操作 2：1 个冲突；执行操作 3：2 个冲突……）。

#### B4：真实编辑数据集

重放真实世界的编辑数据集。该数据集记录了一份大型文本的逐字符编辑历史，原始 LaTeX 文档见：https://arxiv.org/abs/1608.03960

来源：https://github.com/automerge/automerge-perf/tree/master/edit-by-index

- 182,315 次单字符插入
- 77,463 次单字符删除
- 共 259,778 次操作
- 最终文档包含 104,852 个字符

我们模拟单个客户端重放全部变更并保存每次更新。统计指标包括重放全部变更的耗时以及所有更新消息的大小（`updateSize`）、任务结束后文档的编码大小（`docSize`）、编码文档所需时间（`encodeTime`）、解析编码文档的时间（`parseTime`），以及文档解码后常驻内存的占用（`memUsed`）。

##### [B4 × 100] 将真实编辑数据集重放 100 次

将 [B4] 数据集重放一百遍，最终文档超过一千万个字符。作为对比，《权力的游戏：冰与火之歌》全书（含空白）也只有约 160 万字符。

- 18,231,500 次单字符插入
- 7,746,300 次单字符删除
- 共 25,977,800 次操作
- 最终文档包含 10,485,200 个字符

</details>

下表保留了基准脚本输出时的英文任务名称，便于与原始数据对照。

| N = 6000                                                                 |              yjs |           ywasm |             loro |         loro-old |        automerge |  automerge-wasm |
| :----------------------------------------------------------------------- | ---------------: | --------------: | ---------------: | ---------------: | ---------------: | --------------: |
| 版本                                                                      |          13.6.15 |          0.17.4 |     1.0.0-beta.2 |           0.15.2 |           2.1.10 |           0.9.0 |
| 包体积                                                                    |     84,017 bytes |   938,991 bytes |  2,919,363 bytes |  1,583,094 bytes |  1,696,176 bytes | 1,701,136 bytes |
| 包体积（gzip）                                                            |     25,105 bytes |   284,616 bytes |    894,460 bytes |    592,039 bytes |    591,049 bytes |   594,071 bytes |
| [B1.1] Append N characters (time)                                        |           141 ms |          171 ms |           164 ms |           115 ms |           279 ms |          110 ms |
| [B1.1] Append N characters (avgUpdateSize)                               |         27 bytes |        27 bytes |         88 bytes |         58 bytes |        121 bytes |       121 bytes |
| [B1.1] Append N characters (encodeTime)                                  |             1 ms |            0 ms |             3 ms |             0 ms |             5 ms |            6 ms |
| [B1.1] Append N characters (docSize)                                     |      6,031 bytes |     6,031 bytes |     12,382 bytes |      6,219 bytes |      3,992 bytes |     3,992 bytes |
| [B1.1] Append N characters (memUsed)                                     |              0 B |             0 B |              0 B |              0 B |              0 B |             0 B |
| [B1.1] Append N characters (parseTime)                                   |            22 ms |           65 ms |            28 ms |            28 ms |            59 ms |           61 ms |
| [B1.2] Insert string of length N (time)                                  |             1 ms |            1 ms |             0 ms |             0 ms |            18 ms |           14 ms |
| [B1.2] Insert string of length N (avgUpdateSize)                         |      6,031 bytes |     6,031 bytes |      6,089 bytes |      6,088 bytes |      6,201 bytes |     6,201 bytes |
| [B1.2] Insert string of length N (encodeTime)                            |             0 ms |            0 ms |             0 ms |             0 ms |             2 ms |            2 ms |
| [B1.2] Insert string of length N (docSize)                               |      6,031 bytes |     6,031 bytes |     12,313 bytes |      6,146 bytes |      3,974 bytes |     3,974 bytes |
| [B1.2] Insert string of length N (parseTime)                             |            27 ms |           47 ms |            27 ms |            26 ms |            29 ms |           30 ms |
| [B1.3] Prepend N characters (time)                                       |           118 ms |           30 ms |           111 ms |            47 ms |           272 ms |           73 ms |
| [B1.3] Prepend N characters (avgUpdateSize)                              |         27 bytes |        26 bytes |         87 bytes |         57 bytes |        116 bytes |       116 bytes |
| [B1.3] Prepend N characters (encodeTime)                                 |             2 ms |            0 ms |             2 ms |             1 ms |             4 ms |            4 ms |
| [B1.3] Prepend N characters (docSize)                                    |      6,041 bytes |     6,040 bytes |     15,414 bytes |      6,165 bytes |      3,988 bytes |     3,988 bytes |
| [B1.3] Prepend N characters (parseTime)                                  |            45 ms |           38 ms |            27 ms |            37 ms |            73 ms |           47 ms |
| [B1.4] Insert N characters at random positions (time)                    |           128 ms |          101 ms |           113 ms |            51 ms |           268 ms |           89 ms |
| [B1.4] Insert N characters at random positions (avgUpdateSize)           |         29 bytes |        29 bytes |         88 bytes |         58 bytes |        121 bytes |       121 bytes |
| [B1.4] Insert N characters at random positions (encodeTime)              |             3 ms |            0 ms |             2 ms |             1 ms |             6 ms |            5 ms |
| [B1.4] Insert N characters at random positions (docSize)                 |     29,571 bytes |    29,554 bytes |     39,040 bytes |     29,503 bytes |     24,743 bytes |    24,743 bytes |
| [B1.4] Insert N characters at random positions (parseTime)               |            46 ms |           30 ms |            27 ms |            26 ms |            73 ms |           64 ms |
| [B1.5] Insert N words at random positions (time)                         |           149 ms |          264 ms |           112 ms |            54 ms |           539 ms |          291 ms |
| [B1.5] Insert N words at random positions (avgUpdateSize)                |         36 bytes |        36 bytes |         95 bytes |         65 bytes |        131 bytes |       131 bytes |
| [B1.5] Insert N words at random positions (encodeTime)                   |             6 ms |            1 ms |             3 ms |             1 ms |            14 ms |           15 ms |
| [B1.5] Insert N words at random positions (docSize)                      |     87,868 bytes |    87,924 bytes |    135,713 bytes |     98,901 bytes |     96,203 bytes |    96,203 bytes |
| [B1.5] Insert N words at random positions (parseTime)                    |            50 ms |           33 ms |            27 ms |            33 ms |           101 ms |          111 ms |
| [B1.6] Insert string, then delete it (time)                              |             1 ms |            0 ms |             2 ms |             1 ms |            39 ms |           31 ms |
| [B1.6] Insert string, then delete it (avgUpdateSize)                     |      6,053 bytes |     6,052 bytes |      6,189 bytes |      6,179 bytes |      6,338 bytes |     6,338 bytes |
| [B1.6] Insert string, then delete it (encodeTime)                        |             0 ms |            0 ms |             0 ms |             0 ms |             3 ms |            2 ms |
| [B1.6] Insert string, then delete it (docSize)                           |      6,040 bytes |     6,039 bytes |      6,409 bytes |      6,145 bytes |      3,993 bytes |     3,993 bytes |
| [B1.6] Insert string, then delete it (parseTime)                         |            29 ms |           29 ms |            26 ms |            28 ms |            52 ms |           44 ms |
| [B1.7] Insert/Delete strings at random positions (time)                  |           153 ms |          112 ms |           136 ms |            60 ms |           423 ms |          212 ms |
| [B1.7] Insert/Delete strings at random positions (avgUpdateSize)         |         31 bytes |        31 bytes |        100 bytes |         61 bytes |        135 bytes |       135 bytes |
| [B1.7] Insert/Delete strings at random positions (encodeTime)            |             3 ms |            1 ms |             3 ms |             1 ms |            13 ms |           11 ms |
| [B1.7] Insert/Delete strings at random positions (docSize)               |     41,917 bytes |    41,592 bytes |     81,700 bytes |     51,470 bytes |     59,281 bytes |    59,281 bytes |
| [B1.7] Insert/Delete strings at random positions (parseTime)             |            53 ms |           41 ms |            25 ms |            27 ms |            80 ms |           78 ms |
| [B1.8] Append N numbers (time)                                           |           140 ms |           59 ms |           155 ms |            73 ms |           448 ms |          113 ms |
| [B1.8] Append N numbers (avgUpdateSize)                                  |         32 bytes |        32 bytes |         94 bytes |         62 bytes |        125 bytes |       125 bytes |
| [B1.8] Append N numbers (encodeTime)                                     |             2 ms |            0 ms |             2 ms |             2 ms |             6 ms |            6 ms |
| [B1.8] Append N numbers (docSize)                                        |     35,641 bytes |    35,634 bytes |     71,568 bytes |     47,625 bytes |     26,985 bytes |    26,985 bytes |
| [B1.8] Append N numbers (parseTime)                                      |            32 ms |           43 ms |            31 ms |            29 ms |            76 ms |           67 ms |
| [B1.9] Insert Array of N numbers (time)                                  |             3 ms |            3 ms |            13 ms |             9 ms |            47 ms |           22 ms |
| [B1.9] Insert Array of N numbers (avgUpdateSize)                         |     35,653 bytes |    35,657 bytes |     35,715 bytes |     35,717 bytes |     31,199 bytes |    31,199 bytes |
| [B1.9] Insert Array of N numbers (encodeTime)                            |             1 ms |            0 ms |             2 ms |             1 ms |             4 ms |            2 ms |
| [B1.9] Insert Array of N numbers (docSize)                               |     35,653 bytes |    35,657 bytes |     71,578 bytes |     47,646 bytes |     26,953 bytes |    26,953 bytes |
| [B1.9] Insert Array of N numbers (parseTime)                             |            43 ms |           29 ms |            31 ms |            29 ms |            56 ms |           44 ms |
| [B1.10] Prepend N numbers (time)                                         |           157 ms |           31 ms |           125 ms |            53 ms |           484 ms |          159 ms |
| [B1.10] Prepend N numbers (avgUpdateSize)                                |         32 bytes |        32 bytes |         93 bytes |         61 bytes |        120 bytes |       120 bytes |
| [B1.10] Prepend N numbers (encodeTime)                                   |             3 ms |            1 ms |             3 ms |             1 ms |             6 ms |            6 ms |
| [B1.10] Prepend N numbers (docSize)                                      |     35,669 bytes |    35,665 bytes |     76,773 bytes |     47,645 bytes |     26,987 bytes |    26,987 bytes |
| [B1.10] Prepend N numbers (parseTime)                                    |            53 ms |           33 ms |            48 ms |            39 ms |            65 ms |           67 ms |
| [B1.11] Insert N numbers at random positions (time)                      |           160 ms |          121 ms |           125 ms |            56 ms |           517 ms |          121 ms |
| [B1.11] Insert N numbers at random positions (avgUpdateSize)             |         34 bytes |        34 bytes |         94 bytes |         60 bytes |        125 bytes |       125 bytes |
| [B1.11] Insert N numbers at random positions (encodeTime)                |             2 ms |            1 ms |             4 ms |             1 ms |             8 ms |            6 ms |
| [B1.11] Insert N numbers at random positions (docSize)                   |     59,132 bytes |    59,137 bytes |    100,632 bytes |     70,901 bytes |     47,746 bytes |    47,746 bytes |
| [B1.11] Insert N numbers at random positions (parseTime)                 |            52 ms |           50 ms |            58 ms |            41 ms |           428 ms |           80 ms |
| [B2.1] Concurrently insert string of length N at index 0 (time)          |             1 ms |            0 ms |             1 ms |             0 ms |            75 ms |           32 ms |
| [B2.1] Concurrently insert string of length N at index 0 (updateSize)    |      6,094 bytes |     6,094 bytes |      6,188 bytes |      9,244 bytes |      9,499 bytes |     9,499 bytes |
| [B2.1] Concurrently insert string of length N at index 0 (encodeTime)    |             0 ms |            0 ms |             0 ms |             0 ms |             7 ms |            5 ms |
| [B2.1] Concurrently insert string of length N at index 0 (docSize)       |     12,151 bytes |    12,151 bytes |     24,735 bytes |     12,281 bytes |      8,011 bytes |     8,011 bytes |
| [B2.1] Concurrently insert string of length N at index 0 (parseTime)     |            28 ms |           34 ms |            30 ms |            27 ms |            60 ms |           48 ms |
| [B2.2] Concurrently insert N characters at random positions (time)       |            46 ms |          166 ms |            55 ms |           125 ms |           270 ms |          399 ms |
| [B2.2] Concurrently insert N characters at random positions (updateSize) |     33,420 bytes |    33,444 bytes |     23,779 bytes |    350,337 bytes |     27,476 bytes | 1,093,293 bytes |
| [B2.2] Concurrently insert N characters at random positions (encodeTime) |             2 ms |            1 ms |             4 ms |             1 ms |             6 ms |           11 ms |
| [B2.2] Concurrently insert N characters at random positions (docSize)    |     66,808 bytes |    66,852 bytes |     79,937 bytes |     59,358 bytes |     50,686 bytes |    50,704 bytes |
| [B2.2] Concurrently insert N characters at random positions (parseTime)  |            67 ms |           69 ms |            27 ms |            27 ms |            51 ms |           95 ms |
| [B2.3] Concurrently insert N words at random positions (time)            |           105 ms |          459 ms |            68 ms |           120 ms |           435 ms |          630 ms |
| [B2.3] Concurrently insert N words at random positions (updateSize)      |     89,143 bytes |    88,994 bytes |     62,640 bytes |    408,723 bytes |    122,485 bytes | 1,185,202 bytes |
| [B2.3] Concurrently insert N words at random positions (encodeTime)      |             7 ms |            2 ms |             7 ms |             3 ms |            28 ms |           35 ms |
| [B2.3] Concurrently insert N words at random positions (docSize)         |    178,428 bytes |   178,130 bytes |    268,884 bytes |    197,284 bytes |    185,019 bytes |   191,498 bytes |
| [B2.3] Concurrently insert N words at random positions (parseTime)       |            82 ms |           67 ms |            31 ms |            30 ms |           134 ms |          184 ms |
| [B2.4] Concurrently insert & delete (time)                               |           145 ms |        1,243 ms |           118 ms |           282 ms |           653 ms |        1,311 ms |
| [B2.4] Concurrently insert & delete (updateSize)                         |    140,984 bytes |   141,122 bytes |    123,725 bytes |    798,123 bytes |    298,810 bytes | 2,395,876 bytes |
| [B2.4] Concurrently insert & delete (encodeTime)                         |             6 ms |            3 ms |            14 ms |             4 ms |            43 ms |           56 ms |
| [B2.4] Concurrently insert & delete (docSize)                            |    282,112 bytes |   282,358 bytes |    392,151 bytes |    304,592 bytes |    293,831 bytes |   307,291 bytes |
| [B2.4] Concurrently insert & delete (parseTime)                          |           105 ms |           73 ms |            34 ms |            31 ms |           185 ms |          269 ms |
| [B3.1] 20√N clients concurrently set number in Map (time)                |            54 ms |           60 ms |            27 ms |            32 ms |         1,058 ms |           21 ms |
| [B3.1] 20√N clients concurrently set number in Map (updateSize)          |     49,167 bytes |    49,162 bytes |    132,376 bytes |     63,832 bytes |    283,296 bytes |   283,296 bytes |
| [B3.1] 20√N clients concurrently set number in Map (encodeTime)          |             3 ms |            1 ms |            16 ms |             1 ms |             9 ms |           12 ms |
| [B3.1] 20√N clients concurrently set number in Map (docSize)             |     36,763 bytes |    36,751 bytes |     78,764 bytes |     38,428 bytes |     86,165 bytes |    86,164 bytes |
| [B3.1] 20√N clients concurrently set number in Map (parseTime)           |            57 ms |           67 ms |            83 ms |            49 ms |            59 ms |           54 ms |
| [B3.2] 20√N clients concurrently set Object in Map (time)                |            55 ms |           62 ms |            27 ms |            40 ms |         1,126 ms |           28 ms |
| [B3.2] 20√N clients concurrently set Object in Map (updateSize)          |     85,084 bytes |    85,073 bytes |    171,370 bytes |     99,753 bytes |    398,090 bytes |   325,370 bytes |
| [B3.2] 20√N clients concurrently set Object in Map (encodeTime)          |             2 ms |            1 ms |            18 ms |             2 ms |            21 ms |           17 ms |
| [B3.2] 20√N clients concurrently set Object in Map (docSize)             |     72,682 bytes |    72,659 bytes |     84,255 bytes |     75,227 bytes |    112,588 bytes |    93,401 bytes |
| [B3.2] 20√N clients concurrently set Object in Map (parseTime)           |            73 ms |           68 ms |            83 ms |            48 ms |            68 ms |           59 ms |
| [B3.3] 20√N clients concurrently set String in Map (time)                |           124 ms |           61 ms |            63 ms |            73 ms |         1,869 ms |          166 ms |
| [B3.3] 20√N clients concurrently set String in Map (updateSize)          |  7,826,229 bytes | 7,826,225 bytes |  7,912,520 bytes |  7,840,917 bytes |  8,063,440 bytes | 8,063,440 bytes |
| [B3.3] 20√N clients concurrently set String in Map (encodeTime)          |            56 ms |            5 ms |            70 ms |            23 ms |            59 ms |           61 ms |
| [B3.3] 20√N clients concurrently set String in Map (docSize)             |  7,813,826 bytes | 7,813,814 bytes |    241,646 bytes |  7,815,537 bytes |     97,997 bytes |    98,008 bytes |
| [B3.3] 20√N clients concurrently set String in Map (parseTime)           |           141 ms |           75 ms |           161 ms |            44 ms |            80 ms |           76 ms |
| [B3.4] 20√N clients concurrently insert text in Array (time)             |            45 ms |           49 ms |           195 ms |            28 ms |         1,768 ms |           19 ms |
| [B3.4] 20√N clients concurrently insert text in Array (updateSize)       |     52,751 bytes |    52,735 bytes |    137,490 bytes |     70,514 bytes |    311,830 bytes |   285,330 bytes |
| [B3.4] 20√N clients concurrently insert text in Array (encodeTime)       |             1 ms |            0 ms |            13 ms |             1 ms |            13 ms |            7 ms |
| [B3.4] 20√N clients concurrently insert text in Array (docSize)          |     26,596 bytes |    26,580 bytes |    100,791 bytes |     47,943 bytes |     96,423 bytes |    86,519 bytes |
| [B3.4] 20√N clients concurrently insert text in Array (parseTime)        |            55 ms |           37 ms |            94 ms |            30 ms |            43 ms |           37 ms |
| [B4] Apply real-world editing dataset (time)                             |         2,616 ms |       17,556 ms |         2,271 ms |           768 ms |         7,109 ms |        2,775 ms |
| [B4] Apply real-world editing dataset (encodeTime)                       |             4 ms |            8 ms |            11 ms |             3 ms |           165 ms |          161 ms |
| [B4] Apply real-world editing dataset (docSize)                          |    226,981 bytes |   226,981 bytes |    230,556 bytes |    260,813 bytes |    129,116 bytes |   129,116 bytes |
| [B4] Apply real-world editing dataset (parseTime)                        |            27 ms |           22 ms |             6 ms |             4 ms |         1,185 ms |        1,123 ms |
| [B4x100] Apply real-world editing dataset 100 times (time)               |       279,705 ms |         skipped |       233,739 ms |        75,122 ms |          skipped |         skipped |
| [B4x100] Apply real-world editing dataset 100 times (encodeTime)         |           417 ms |         skipped |           743 ms |           205 ms |          skipped |         skipped |
| [B4x100] Apply real-world editing dataset 100 times (docSize)            | 22,694,543 bytes |         skipped | 21,016,454 bytes | 26,826,427 bytes |          skipped |         skipped |
| [B4x100] Apply real-world editing dataset 100 times (parseTime)          |         1,270 ms |         skipped |            66 ms |           200 ms |          skipped |         skipped |
| [B3.5] 20√N clients concurrently insert text (time)                      |            42 ms |           49 ms |           212 ms |           115 ms |         1,869 ms |           36 ms |
| [B3.5] 20√N clients concurrently insert text (updateSize)                |     48,129 bytes |    48,135 bytes |    132,870 bytes |     68,978 bytes |    298,020 bytes |   298,020 bytes |
| [B3.5] 20√N clients concurrently insert text (encodeTime)                |             1 ms |            0 ms |            13 ms |             1 ms |            12 ms |           16 ms |
| [B3.5] 20√N clients concurrently insert text (docSize)                   |     24,313 bytes |    24,325 bytes |    102,818 bytes |     48,053 bytes |     90,768 bytes |    90,781 bytes |
| [B3.5] 20√N clients concurrently insert text (parseTime)                 |            38 ms |           38 ms |            64 ms |            63 ms |            67 ms |           55 ms |
| [C1.1] Concurrently insert & delete 100K (time)                          |        27,138 ms |         skipped |         2,335 ms |          skipped |        50,692 ms |         skipped |
| [C1.1] Concurrently insert & delete 100K (updateSize)                    |  4,908,122 bytes |         skipped |  4,269,521 bytes |          skipped | 10,326,487 bytes |         skipped |
| [C1.1] Concurrently insert & delete 100K (encodeTime)                    |           129 ms |         skipped |           210 ms |          skipped |           837 ms |         skipped |
| [C1.1] Concurrently insert & delete 100K (docSize)                       |  4,908,186 bytes |         skipped |  6,748,052 bytes |          skipped |  5,404,289 bytes |         skipped |
| [C1.1] Concurrently insert & delete 100K (parseTime)                     |         1,653 ms |         skipped |            78 ms |          skipped |         7,308 ms |         skipped |
| [C1.1] Concurrently insert & delete 100K (versionSize)                   |    222,681 bytes |         skipped |         28 bytes |          skipped |         64 bytes |         skipped |
| [C1.2] Concurrently set Map 100K (time)                                  |        31,598 ms |         skipped |           488 ms |          skipped |       472,547 ms |         skipped |
| [C1.2] Concurrently set Map 100K (updateSize)                            |    980,804 bytes |         skipped |  2,601,744 bytes |          skipped |  5,541,744 bytes |         skipped |
| [C1.2] Concurrently set Map 100K (encodeTime)                            |            60 ms |         skipped |           203 ms |          skipped |         2,652 ms |         skipped |
| [C1.2] Concurrently set Map 100K (docSize)                               |    738,949 bytes |         skipped |  1,539,209 bytes |          skipped |  1,743,081 bytes |         skipped |
| [C1.2] Concurrently set Map 100K (parseTime)                             |         4,069 ms |         skipped |           631 ms |          skipped |           338 ms |         skipped |
| [C1.2] Concurrently set Map 100K (versionSize)                           |    416,246 bytes |         skipped |    314,810 bytes |          skipped |  1,949,999 bytes |         skipped |
