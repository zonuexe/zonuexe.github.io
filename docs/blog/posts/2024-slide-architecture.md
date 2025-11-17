---
title: "スライドの裏側: zonuexe.slides の構成"
description: zonuexe.github.io/slides を支えるビルドとデザインのメモ。
date: 2024-11-18
tags:
  - slides
  - tooling
  - design
outline: [2, 3]
---

## ざっくり構成

- VitePress + custom theme でデータを静的生成
- Cloudflare Pages でプレビュー、GitHub Pages で配信
- deck.js ベースの古い資料も iframe でまとめて検索対象に

## スタイルガイド

今回の zonuexe.github.io でも使っている配色は、Slides 用に作った `index.css` を下敷きにしました。以下のコンセプトを守っておくと、どのページでも統一感が出ます。

- ブルーのアクセントカラーと柔らかいパネルのレイヤー感
- カードは必ず 18px 以上のボーダー半径で、影は 25px 45px のぼかし
- ライト / ダークモードでもコンテンツのコントラスト比を 4.5:1 以上に保つ

## データ更新の流れ

1. slides リポジトリの `slides.yaml` にイベントを追加
2. `pnpm generate` で JSON に変換し、VitePress に流し込む
3. zonuexe.github.io 側のトップページやブログにリンクを追記

ブログでは、スライドの補足や制作裏話を少しずつ記録していきます。
