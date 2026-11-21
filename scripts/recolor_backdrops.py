"""Re-tint the pink studio backdrop of each menu photo to a colour taken from the cake itself.
The cake is cut out with GrabCut (border = background); only backdrop pixels change, and their
original light/shadow is kept by scaling the new colour with the old brightness.
Usage: python3 scripts/recolor_backdrops.py public/menu   (run after design_crops.py)"""
import sys
import cv2
import numpy as np

DIR = sys.argv[1]
# backdrop colour per cake (BGR), picked to match each cake; raspberry keeps the designer's rose
THEMES = {
    "blueberry": (196, 150, 160),  # lavender
    "mango": (86, 190, 238),  # mango yellow
    "pineapple": (130, 205, 228),  # pale pineapple
    "blackforest": (70, 95, 135),  # cocoa
    "redvelvet": (78, 70, 178),  # velvet red
    "strawberry": (122, 110, 226),  # strawberry
    "hazelnut": (92, 130, 172),  # hazelnut
}

for name, bgr in THEMES.items():
    path = f"{DIR}/{name}.webp"
    im = cv2.imread(path)
    h, w = im.shape[:2]
    mask = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
    # the cake sits in the middle: probable foreground there, certain background along the edges
    mask[int(h * 0.12) : int(h * 0.97), int(w * 0.14) : int(w * 0.86)] = cv2.GC_PR_FGD
    b = max(4, int(min(h, w) * 0.03))
    mask[:b, :] = mask[:, :b] = mask[:, -b:] = cv2.GC_BGD
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(im, mask, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
    fg = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 1.0, 0.0).astype(np.float32)
    # under the cake GrabCut keeps a patch of shadowed backdrop: below the cake's middle, anything
    # whose colour (a,b in Lab, ignoring brightness) matches the backdrop is backdrop
    labi = cv2.cvtColor(im, cv2.COLOR_BGR2LAB).astype(np.float32)
    bg_ab = labi[fg < 0.5][:, 1:].mean(axis=0)
    dab = np.linalg.norm(labi[..., 1:] - bg_ab, axis=2)
    low = np.zeros_like(fg, bool)
    low[int(h * 0.6) :, :] = True
    lum0 = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
    bright = lum0 > 0.7 * float(lum0[fg < 0.5].mean())  # dark chocolate and red crumb are never backdrop
    cand = ((dab < 9) & low & bright).astype(np.uint8)
    # only patches that touch the known backdrop, so nothing inside the cake is taken
    n2, lab2 = cv2.connectedComponents(cand)
    touching = np.unique(lab2[(cand > 0) & (cv2.dilate((fg < 0.5).astype(np.uint8), np.ones((5, 5), np.uint8)) > 0)])
    fg[np.isin(lab2, touching[touching > 0])] = 0
    # keep the largest foreground blob only, then feather the edge
    n, lab, stats, _ = cv2.connectedComponentsWithStats((fg > 0).astype(np.uint8))
    if n > 1:
        keep = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        fg = (lab == keep).astype(np.float32)
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    alpha = cv2.GaussianBlur(fg, (0, 0), 2.2)[..., None]

    # new backdrop: theme colour carrying the old backdrop's light and shadow
    lum = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
    bg_mean = float(lum[fg < 0.5].mean())
    shade = (lum / bg_mean)[..., None]
    back = np.clip(np.array(bgr, np.float32)[None, None, :] * shade, 0, 255)
    out = im.astype(np.float32) * alpha + back * (1 - alpha)
    cv2.imwrite(path, out.astype(np.uint8), [cv2.IMWRITE_WEBP_QUALITY, 92])
    print(name, "fg share", round(float(fg.mean()), 3))
