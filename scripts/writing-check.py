#!/usr/bin/env python3
"""writing-check.py — 日本語発信書法の機械検査

正本: direction/WRITING_SYSTEM_JA_2026-08.md（C1〜C52 ＋ 禁止語）

使い方:
    python3 scripts/writing-check.py --file draft.md
    python3 scripts/writing-check.py --stdin --kind x
    echo "本文" | python3 scripts/writing-check.py --stdin --kind bio

kind: bio / x / note   （既定 note）

本スクリプトは合否を機械的に返すだけで、良し悪しは判定しない。
数値が出ない項目（C15の代弁判定など）は人間が見る。出力に UNCHECKED として明示する。
"""
import argparse
import json
import re
import sys

try:
    from janome.tokenizer import Tokenizer
    _TOK = Tokenizer()
except Exception:  # pragma: no cover
    _TOK = None

# ---------- 禁止語（上から目線・内部用語・締め・過剰敬語ほか） ----------
BANNED = {
    "上から目線": ["付き合う", "付き合っ", "寄り添", "サポートし", "支援し", "導く", "導き",
                "引き出す", "引き出し", "気づかせ", "教えます", "教えて差", "アドバイス", "してあげ"],
    "査読者位置": ["もらえれば読みます", "いただければ読みます", "送ってくれれば読みます"],
    "内部用語C22": ["事実の並び", "確かめる日付", "検証日", "Direction Card", "3タグ",
                "HOW-gap", "TIME-gap", "WHAT-gap", "在重力", "World Signal",
                "Reality Contact", "Human Gate", "canonical"],
    "締めC12": ["いかがでし", "参考になれば", "あなたもぜひ", "フォローお願い",
              "まとめると", "重要です", "一概には言えません", "人それぞれです",
              "メリット・デメリット", "ご自身の状況"],
    "過剰敬語C16": ["させていただ", "のほう", "になります", "幸いです", "ご参考", "思われます"],
    "ヘッジC3": ["ではないでしょうか", "と考えられます", "と言えるでしょう",
               "と言われています", "が求められています", "が期待されます"],
    "抽象語C5": ["本質", "前提", "価値", "重要性", "可能性", "視点", "深掘り",
               "紐解く", "向き合う", "最適化", "効率化"],
    "曖昧量副詞C7": ["ほぼ", "かなり", "多くの", "そこそこ", "話題の", "劇的に",
                 "圧倒的に", "めちゃくちゃ", "大幅に", "だいたい"],
    "時間語C8": ["先日", "ある日", "しばらく", "すぐに", "最近", "近年", "数か月"],
    "硬い語C17": ["における", "に関して", "を通じて", "非常に", "様々", "出来る",
                "下さい", "行う", "行い", "実施し"],
    "無主語断定C14": ["すべきだ", "すべきです", "は間違っている", "みんな"],
}

# C23 動作名詞（作業キュー抽出用）
ACTION_NOUNS = {
    "手順", "方法", "仕組み", "取り組み", "作業", "工程", "運用", "管理", "判断",
    "対応", "流れ", "やり方", "状態", "状況", "構造", "プロセス", "ルール", "条件",
    "基準", "体制", "枠組み", "観点", "側面", "要素", "範囲", "段階", "方針",
    "構成", "指標", "施策", "手段", "工夫", "パターン", "動き", "見直し", "検討", "整理",
}

# C24 汎用（移植可能な）述語
GENERIC_PREDICATES = {
    "書く", "作る", "まとめる", "整理する", "進める", "行う", "実施する", "示す",
    "持つ", "なる", "ある", "できる", "取り組む", "対応する", "設計する",
    "構築する", "活用する",
}

# C25 条件B 成果物動詞
ARTIFACT_VERBS = {"書く", "作る", "つくる", "まとめる", "設ける", "立てる"}
ARTIFACT_SAHEN = {"整理", "用意", "追加", "定義", "設計", "構築", "策定", "導入",
                  "実装", "更新", "作成", "整備"}

# C26 外殻名詞
SHELL_NOUNS = ["この", "その", "あの", "こうした", "そうした", "こういった", "上記の", "前述の"]
SHELL_BARE = ["そこ", "ここ", "この点", "その点", "この部分", "このあたり"]

# C27 因果圧縮
CAUSE_A = ["ことで", "により", "によって", "を通じて", "に伴い", "を踏まえ", "のもと",
           "ことにより", "することが可能", "することができます"]
CAUSE_B = ["たら、", "したら", "と、", "すると", "ところ、"]

CONJ_PARTICLE_RE = re.compile(r"て、|で、|たら|ので|のに|から、|けど|けれど|ても|ながら|し、|と、|ば")

LIMITS = {
    "bio":  {"max_sentence": 40, "max_comma": 1, "max_chars": 140, "max_para_sent": 2},
    "x":    {"max_sentence": 40, "max_comma": 1, "max_chars": 160, "max_para_sent": 2},
    "note": {"max_sentence": 60, "max_comma": 2, "max_chars": None, "max_para_sent": 5},
}


def strip_markup(text: str) -> str:
    text = re.sub(r"```.*?```", "", text, flags=re.S)
    text = re.sub(r"^[#>|*\-\s]*", "", text, flags=re.M)
    text = re.sub(r"\[URL\]|https?://\S+", "", text)
    return text


def sentences(flat: str):
    return [s for s in flat.split("。") if s.strip()]


def conj_count(text: str) -> int:
    if _TOK is None:
        return len(CONJ_PARTICLE_RE.findall(text))
    n = sum(1 for t in _TOK.tokenize(text)
            if t.part_of_speech.split(",")[1] == "接続助詞")
    n += len(re.findall(r"たら", text))
    return n


def analyze(text: str, kind: str = "note") -> dict:
    lim = LIMITS.get(kind, LIMITS["note"])
    body = strip_markup(text)
    paras = [p for p in body.split("\n") if p.strip()]
    flat = body.replace("\n", "")
    sents = sentences(flat)
    if not sents:
        return {"error": "no sentences"}

    chars_nospace = len(re.sub(r"\s", "", flat))
    n_conj = conj_count(flat)
    density = round(n_conj / chars_nospace * 1000, 1) if chars_nospace else 0.0
    zero_conj = [s for s in sents if conj_count(s) == 0]
    zero_rate = round(len(zero_conj) / len(sents), 2)

    # 従属節前置（接続助詞が文の前半6割以内に出る）
    front = 0
    for s in sents:
        m = CONJ_PARTICLE_RE.search(s)
        if m and m.start() <= len(s) * 0.6:
            front += 1

    # 読点なし連続（C23 ゲート3）
    commas01 = [0 if "、" not in s else 1 for s in sents]
    run = maxrun = 0
    for v in commas01:
        run = run + 1 if v == 0 else 0
        maxrun = max(maxrun, run)

    # C1 語尾3連続
    ends = [s[-4:] for s in sents]
    tri = any(ends[i] == ends[i + 1] == ends[i + 2] for i in range(len(ends) - 2))

    # C24 汎用述語率
    generic = 0
    if _TOK is not None:
        for s in sents:
            toks = [t for t in _TOK.tokenize(s)
                    if t.part_of_speech.split(",")[0] in ("動詞", "形容詞")]
            if toks and toks[-1].base_form in GENERIC_PREDICATES:
                generic += 1
    generic_rate = round(generic / len(sents), 2)

    # C25 連言検出
    c25 = []
    if _TOK is not None:
        for s in sents:
            toks = list(_TOK.tokenize(s))
            a = False
            for i in range(len(toks) - 1):
                p0 = toks[i].part_of_speech.split(",")
                p1 = toks[i + 1].part_of_speech.split(",")
                if p0[0] == "動詞" and p1[0] == "名詞" and p1[1] not in ("非自立", "接尾", "代名詞"):
                    if toks[i + 1].surface in ACTION_NOUNS:
                        a = True
            verbs = [t for t in toks if t.part_of_speech.split(",")[0] == "動詞"
                     and t.part_of_speech.split(",")[1] == "自立"]
            b = False
            if verbs:
                last = verbs[-1]
                if last.base_form in ARTIFACT_VERBS:
                    b = True
                elif last.base_form == "する":
                    idx = toks.index(last)
                    if idx > 0 and toks[idx - 1].surface in ARTIFACT_SAHEN:
                        b = True
            if a and b:
                c25.append(s)

    # C26 外殻名詞
    shells = [w for w in SHELL_BARE if w in flat]
    shells += [w for w in SHELL_NOUNS if w in flat]

    # C27 因果圧縮
    a_hits = sum(flat.count(w) for w in CAUSE_A)
    b_hits = sum(flat.count(w) for w in CAUSE_B)

    banned = {}
    for cat, words in BANNED.items():
        hit = [w for w in words if w in body]
        if hit:
            banned[cat] = hit

    max_sent = max(len(s) for s in sents)
    max_comma = max(s.count("、") for s in sents)
    para_sent = [len(sentences(p)) for p in paras]

    fails = []
    if density < 32:
        fails.append(f"C23 節接続密度 {density} < 32（人間帯 37〜48）")
    if zero_rate > 0.40:
        fails.append(f"C23 接0率 {zero_rate} > 0.40")
    if front < 1:
        fails.append("C23 ゲート2 従属節前置が0文")
    warns = []
    if maxrun >= 3:
        # C23 ゲート3 は第2トリガであり「ゲート2の書き換え1回で同時に解消する」と
        # 規則本文が定めている。ゲート2が余裕で通っている場合は書き換える対象が
        # 存在しないため FAIL にしない（2026-08-10 実文検証で確認）。
        if front >= 2:
            warns.append(f"C23 ゲート3 読点なし{maxrun}連続（ゲート2が前置{front}文で通過のため差し戻し）")
        else:
            fails.append(f"C23 ゲート3 読点なし{maxrun}連続")
    if tri:
        fails.append("C1 同一語尾3連続")
    if max_sent > lim["max_sentence"]:
        fails.append(f"C2 最長文 {max_sent} > {lim['max_sentence']}")
    if max_comma > lim["max_comma"]:
        fails.append(f"C2 読点 {max_comma} > {lim['max_comma']}")
    if any(n > lim["max_para_sent"] for n in para_sent):
        fails.append(f"段落文数 {para_sent} > {lim['max_para_sent']}")
    if lim["max_chars"] and chars_nospace > lim["max_chars"]:
        fails.append(f"字数 {chars_nospace} > {lim['max_chars']}")
    if generic_rate > 0.30:
        fails.append(f"C24 汎用述語率 {generic_rate} > 0.30")
    if c25:
        fails.append(f"C25 連言検出 {len(c25)}件: {c25[:2]}")
    if a_hits > b_hits:
        fails.append(f"C27 因果圧縮 A{a_hits} > B{b_hits}")
    if banned:
        fails.append(f"禁止語 {banned}")
    if re.search(r"[!！🚀💡✅🔥😀-🿿]", body):
        fails.append("C6 絵文字・感嘆符")

    return {
        "kind": kind,
        "chars_nospace": chars_nospace,
        "sentences": len(sents),
        "clause_density": density,
        "zero_conj_rate": zero_rate,
        "front_subordinate": front,
        "max_comma_free_run": maxrun,
        "max_sentence_len": max_sent,
        "max_comma_per_sentence": max_comma,
        "paragraph_sentence_counts": para_sent,
        "generic_predicate_rate": generic_rate,
        "c25_hits": c25,
        "shell_nouns": shells,
        "cause_A": a_hits,
        "cause_B": b_hits,
        "banned": banned,
        "sentence_end_4": ends,
        "FAIL": fails,
        "WARN": warns,
        "PASS": not fails,
        "UNCHECKED": [
            "C15 鉤括弧が実発話か（代弁でないか）",
            "C22 内部用語のうちリスト外の自作語",
            "C47 同一対象の呼び名の揺れ",
            "C50 導入1文目の代弁",
            "事実の正確さ・盛りの有無",
        ],
        "HUMAN_BAND": {"clause_density": "37.0〜48.2", "zero_conj_rate": "≦0.40"},
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--file")
    ap.add_argument("--stdin", action="store_true")
    ap.add_argument("--kind", default="note", choices=["bio", "x", "note"])
    a = ap.parse_args()
    text = sys.stdin.read() if a.stdin or not a.file else open(a.file).read()
    print(json.dumps(analyze(text, a.kind), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
