---
title: "tadsan's slide deckとは何か"
description: zonuexe.github.io/slides を支えるビルドとデザインのメモ。
date: 2025-11-18
tags:
- presentation
outline: [2, 3]
---

# tadsan's slide deckとは何か

作ったわけですよ。

[tadsan's slide deck](@:https://zonuexe.github.io/slides/)

このあたりの話はPHP勉強会でも話しました。

[スライドをシェアできるサービスを作る | tadsan's slide deck](@:https://zonuexe.github.io/slides/20250827_build-your-own-slide-deck/)

## つまりどういうことか

 * スライドサービスの<abbr title="サービス終了">サ終</abbr>つらい… もう自前でやるしかない
 * [JSer.info](https://jser.info/)の[azu](https://github.com/azu)さんの成果物をいい感じに利用させてもらった
 * [onk](https://github.com/onk)さんがむかしやってたやつは既に動いてないことは知ってたので静的にこだわった

## どういう構造になっているか

 * [PDF.js - Home](https://mozilla.github.io/pdf.js/)
     * Mozillaが開発しているJavaScriptでPDF表示するライブラリ
     * Firefoxに内蔵されてるPDF表示はこれ
 * [npm: pdf.js-controller](https://www.npmjs.com/package/pdf.js-controller)
     * azuさんが作ったPDF.jsのラッパー
     * [[pdf.js] テキスト選択出来るスライド表示ライブラリを書いた | Web Scratch](https://efcl.info/2015/12/07/pdf.js-controller/)
         * onkさんの [スライド共有サービス hellshake を作りました - onk.ninja](https://blog.onk.ninja/2015/12/02/release-sharedoc)が影響している
         * ↓のPDF表示コントローラを分離したもの
 * [slide-pdf.js](https://github.com/azu/slide-pdf.js)
     * azuさんが作ったプレゼン表示用のSPA
     * [pdf.jsを使いブラウザで見られるPDFスライド表示ツールを作った | Web Scratch](https://efcl.info/2014/10/07/pdf-presentation/)
     * クエリパラメータでPDFのURLを指定して、`<iframe>`で埋め込んで使う
 * [azu/pdf-slide-html: Generator cli for azu/slide-pdf.js.](https://github.com/azu/pdf-slide-html)
     * PDFを埋め込むHTMLジェネレータ (今回は使ってない)
 * <https://github.com/zonuexe/slides>
     * tadsanのスライドPDFを置いてあるリポジトリ

## やったこと

 1. [pdf.js-controllerをfork](https://www.npmjs.com/package/@zonuexe/pdf.js-controller)
     * コードとツールセットを近代化改修・TypeScript化
     * 最新のPDF.jsにアップデート
     * Retinaディスプレイ対応
 2. [slide-pdf.jsをfork](https://github.com/zonuexe/slide-pdf.js)
     * コードとツールセットを近代化改修・TypeScript化
     * fork版の`@zonuexe/pdf.js-controller`に置き換え
     * Speakerウィンドウを追加
     * [Rabbit](https://rabbit-shocker.org/ja/)風タイマーを追加
 3. <https://github.com/zonuexe/slides> にPDFビューアーを実装
     * YAMLに書いたメタデータからページを一覧
     * スライドごとのページで `<iframe>` でslide-pdf.jsを埋め込む
     * PDFに含まれるテキストをすべて抽出して全文検索
         * [Fuse.js](https://www.fusejs.io/)でフロントエンドだけで完結している
     * 最初はHonoを使っていたが、いろいろあって今は[VitePress](https://vitepress.dev/)を使っている

一度はPHPでファイルシステムベースのルーターを自分で書いて置き換えようと思ってたんですが、いろいろ試している間に[Vite](https://ja.vite.dev/)の手触りがいいなということに気付いてしまい、VitePressに書き換えちゃったのでした。これが俺たちが欲しかったやつなんだよ…

実際に勉強会やカンファレンスで使うかはともかく、全画面表示やら別ウィンドウのスピーカービュー、そしてRabbitモードも用意したので、末長く育てていければと思っております。
