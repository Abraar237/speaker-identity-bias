#!/usr/bin/env python3
"""Builds refs.bib from lit_review.csv by querying the arXiv API for real
author/year metadata (verification step per prior-work-check skill stage 3)."""

import csv
import re
import time
import urllib.request
import xml.etree.ElementTree as ET

NS = {"a": "http://www.w3.org/2005/Atom"}


def fetch_arxiv(arxiv_id):
    url = f"http://export.arxiv.org/api/query?id_list={arxiv_id}"
    with urllib.request.urlopen(url, timeout=20) as r:
        xml = r.read()
    root = ET.fromstring(xml)
    entry = root.find("a:entry", NS)
    title = entry.find("a:title", NS).text.strip().replace("\n", " ")
    title = re.sub(r"\s+", " ", title)
    authors = [a.find("a:name", NS).text for a in entry.findall("a:author", NS)]
    published = entry.find("a:published", NS).text
    year = published[:4]
    return title, authors, year


def surname(full_name):
    return full_name.strip().split()[-1]


MANUAL = {
    "Racial22": {
        "key": "koenecke2020racial",
        "entry": '@article{koenecke2020racial,\n  title={Racial disparities in automated speech recognition},\n  author={Koenecke, Allison and Nam, Andrew and Lake, Emily and Nudell, Joe and Quartey, Minnie and Mengesha, Zion and Toups, Connor and Rickford, John R and Jurafsky, Dan and Goel, Sharad},\n  journal={Proceedings of the National Academy of Sciences},\n  volume={117},\n  number={14},\n  pages={7684--7689},\n  year={2020},\n  publisher={National Academy of Sciences}\n}',
    },
    "Reverse24": {
        "key": "kang2009reverse",
        "entry": '@article{kang2009reverse,\n  title={Reverse linguistic stereotyping: Measuring the effect of listener expectations on speech evaluation},\n  author={Kang, Okim and Rubin, Donald L},\n  journal={Journal of Language and Social Psychology},\n  volume={28},\n  number={4},\n  pages={441--456},\n  year={2009},\n  publisher={SAGE Publications}\n}',
    },
    "L2ARCTIC33": {
        "key": "zhao2018l2arctic",
        "entry": '@inproceedings{zhao2018l2arctic,\n  title={L2-ARCTIC: A Non-native English Speech Corpus},\n  author={Zhao, Guanlong and Sonsaat, Sinem and Silpachai, Alif and Lucic, Ivana and Chukharev-Hudilainen, Evgeny and Levis, John and Gutierrez-Osuna, Ricardo},\n  booktitle={Interspeech},\n  pages={2783--2787},\n  year={2018}\n}',
    },
}


def bibtex_entry(key, title, authors, year):
    author_str = " and ".join(authors[:6])
    if len(authors) > 6:
        author_str += " and others"
    return (f"@article{{{key},\n  title={{{title}}},\n  author={{{author_str}}},\n"
            f"  journal={{arXiv preprint arXiv:{key.split('_arxiv_')[-1]}}},\n  year={{{year}}}\n}}")


def main():
    rows = []
    with open("../lit_review/lit_review.csv") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    out_entries = []
    key_map = {}  # row index -> bibkey

    for i, row in enumerate(rows):
        link = row["link"]
        rowkey = f"{re.sub(r'[^a-zA-Z0-9]', '', row['paper'])[:20]}{i}"

        if rowkey in MANUAL:
            key_map[i] = MANUAL[rowkey]["key"]
            out_entries.append(MANUAL[rowkey]["entry"])
            continue

        if i in key_map:
            continue

        m = re.search(r"(\d{4}\.\d{4,5})", link)
        if not m:
            print(f"SKIP (no arxiv id, not in MANUAL): {row['paper'][:60]}")
            continue
        arxiv_id = m.group(1)

        title = authors = year = None
        for attempt in range(5):
            try:
                title, authors, year = fetch_arxiv(arxiv_id)
                break
            except Exception as e:
                print(f"  retry {arxiv_id} ({e}), waiting...")
                time.sleep(5 * (attempt + 1))
        if title is None:
            print(f"FAILED to fetch {arxiv_id} after retries")
            continue
        first_surname = surname(authors[0]).lower().replace("-", "")
        bibkey = f"{first_surname}{year}{re.sub(r'[^a-z]', '', row['paper'].lower())[:12]}"
        key_map[i] = bibkey
        entry = (f"@article{{{bibkey},\n  title={{{title}}},\n"
                 f"  author={{{' and '.join(authors[:6])}{' and others' if len(authors) > 6 else ''}}},\n"
                 f"  journal={{arXiv preprint arXiv:{arxiv_id}}},\n  year={{{year}}}\n}}")
        out_entries.append(entry)
        print(f"[{i}] {bibkey}  <-  {title[:60]}")
        time.sleep(3.0)

    with open("refs.bib", "w") as f:
        f.write("\n\n".join(out_entries) + "\n")

    with open("key_map.csv", "w") as f:
        w = csv.writer(f)
        w.writerow(["row_index", "paper_title", "bibkey"])
        for i, row in enumerate(rows):
            if i in key_map:
                w.writerow([i, row["paper"], key_map[i]])

    print(f"\nWrote {len(out_entries)} entries to refs.bib")


if __name__ == "__main__":
    main()
