"""Shared house style for every figure in this project. Change here, not per-figure."""

import matplotlib.pyplot as plt
import matplotlib.font_manager as fm

PALETTE = {
    "slate": "#155e8c",
    "hot": "#b3006b",
    "shelf": "#c0641a",
    "good": "#1c7a55",
    "ink": "#16130d",
    "ink2": "#3a352b",
    "muted": "#6d665a",
    "faint": "#a49c8c",
    "rule": "#e7e2d5",
    "surface": "#ffffff",
}


def setup():
    plt.rcParams.update({
        "figure.facecolor": PALETTE["surface"],
        "axes.facecolor": PALETTE["surface"],
        "savefig.facecolor": PALETTE["surface"],
        "font.family": "sans-serif",
        "font.sans-serif": ["Helvetica", "Arial", "DejaVu Sans"],
        "text.color": PALETTE["ink"],
        "axes.edgecolor": PALETTE["rule"],
        "axes.labelcolor": PALETTE["muted"],
        "xtick.color": PALETTE["muted"],
        "ytick.color": PALETTE["muted"],
        "axes.linewidth": 0.8,
        "font.size": 9.5,
    })


def eyebrow(ax, text, x=0.0, y=1.06):
    ax.text(x, y, text.upper(), transform=ax.transAxes, fontsize=9,
             color=PALETTE["muted"], ha="left", va="bottom",
             fontweight="medium", family="sans-serif")
    ax.text(x, y, text.upper(), transform=ax.transAxes, fontsize=9,
             color=PALETTE["muted"], ha="left", va="bottom", alpha=0,
             fontweight="medium", family="sans-serif")


def strip_frame(ax):
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color(PALETTE["rule"])
    ax.spines["bottom"].set_color(PALETTE["rule"])
