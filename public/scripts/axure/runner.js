(async (selector = "#preview-container", bridge = "http://127.0.0.1:32767") => {
  const round = (value) =>
    Number.isFinite(value) ? Math.round(value * 100) / 100 : 0;
  const unit = (value, fallback = 0) => {
    const parsed = Number.parseFloat(String(value ?? ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const clamp01 = (value) =>
    Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;

  // 从计算样式里取旋转角度，用于还原 CSS transform: rotate()
  function rotationOf(styles) {
    const transform = String(styles.transform || "");
    if (!transform || transform === "none") return 0;
    const match =
      transform.match(/matrix\(([^)]+)\)/) || transform.match(/matrix3d\(([^)]+)\)/);
    if (!match) return 0;
    const values = match[1].split(",").map(Number);
    if (!Number.isFinite(values[0]) || !Number.isFinite(values[1])) return 0;
    const angle = Math.atan2(values[1], values[0]) * (180 / Math.PI);
    return Math.abs(angle) < 0.01 ? 0 : Math.round(angle * 100) / 100;
  }

  // Axure 的圆角只能取单一数值，百分比按短边换算
  function cornerRadius(value, width, height) {
    const text = String(value || "").trim();
    if (!text) return 0;
    const base = Math.min(width, height);
    if (text.endsWith("%")) return (unit(text) / 100) * base;
    return unit(text);
  }

  let colorProbe = null;
  // color-mix()/oklab()/color(srgb ...) 等写法 Axure 不认识，借助 canvas 采样转成 rgba
  function sampleColor(input) {
    try {
      if (!colorProbe) {
        colorProbe = document.createElement("canvas").getContext("2d", {
          willReadFrequently: true,
        });
      }
      if (!colorProbe) return null;
      colorProbe.clearRect(0, 0, 1, 1);
      colorProbe.fillStyle = "rgba(0, 0, 0, 0)";
      colorProbe.fillStyle = input;
      colorProbe.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = colorProbe.getImageData(0, 0, 1, 1).data;
      if (a === 0) return null;
      return { r: r / 255, g: g / 255, b: b / 255, a: a / 255 };
    } catch {
      return null;
    }
  }

  // CSSStyleDeclaration 的属性在原型上，展开出来是空的，需要显式拷贝
  const STYLE_KEYS = [
    "backgroundColor",
    "backgroundImage",
    "color",
    "fontSize",
    "fontFamily",
    "fontWeight",
    "fontStyle",
    "letterSpacing",
    "textTransform",
    "textDecorationLine",
    "lineHeight",
    "textAlign",
    "filter",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
    "borderTopLeftRadius",
    "borderTopRightRadius",
    "borderBottomRightRadius",
    "borderBottomLeftRadius",
  ];

  function styleSnapshot(styles, patch = {}) {
    const result = {};
    for (const key of STYLE_KEYS) result[key] = styles[key];
    return { ...result, ...patch };
  }

  // 输入框/下拉框文字的内边距与垂直居中位置
  function fieldTextBox(rect, styles) {
    const paddingLeft = unit(styles.paddingLeft) + unit(styles.borderLeftWidth);
    const paddingRight = unit(styles.paddingRight) + unit(styles.borderRightWidth);
    const fontSize = unit(styles.fontSize, 14);
    const lineHeight = unit(styles.lineHeight, 0) || fontSize * 1.4;
    return {
      x: rect.x + paddingLeft,
      y: rect.y + Math.max(0, (rect.height - lineHeight) / 2),
      width: Math.max(1, rect.width - paddingLeft - paddingRight) + 6,
      height: lineHeight + 2,
    };
  }

  function placeholderColor(element, styles) {
    try {
      const color = parseColor(window.getComputedStyle(element, "::placeholder").color);
      if (color && color.a > 0) return color;
    } catch {
      // 部分浏览器不支持读取伪元素样式，回退到正文颜色
    }
    return parseColor(styles.color) || { r: 0, g: 0, b: 0, a: 1 };
  }

  function parseColor(input) {
    const text = String(input || "").trim().toLowerCase();
    if (!text || text === "none" || text === "currentcolor") return null;
    if (text === "transparent") return { r: 0, g: 0, b: 0, a: 0 };

    if (/^#([0-9a-f]{3,8})$/.test(text)) {
      const hex = text.slice(1);
      const full =
        hex.length === 3 || hex.length === 4
          ? hex.split("").map((char) => char + char).join("")
          : hex;
      const r = parseInt(full.slice(0, 2), 16) || 0;
      const g = parseInt(full.slice(2, 4), 16) || 0;
      const b = parseInt(full.slice(4, 6), 16) || 0;
      const a = full.length >= 8 ? (parseInt(full.slice(6, 8), 16) || 0) / 255 : 1;
      return { r: r / 255, g: g / 255, b: b / 255, a };
    }

    const match = text.match(/^(?:rgba|rgb)\((.*)\)$/);
    if (!match) return sampleColor(text);
    const parts = match[1].split(/[,\s/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const [r, g, b, a] = parts;
    return {
      r: clamp01(unit(r) / 255),
      g: clamp01(unit(g) / 255),
      b: clamp01(unit(b) / 255),
      a: clamp01(a === undefined ? 1 : unit(a, 1)),
    };
  }

  function solidFill(color) {
    return { type: 1, enabled: true, color };
  }

  function toAxId(index) {
    return `ax-node-${index}`;
  }

  const baseItem = (index, rect, name, rotation = 0) => ({
    itemType: 1,
    type: 0,
    flippedHorizontal: false,
    flippedVertical: false,
    id: toAxId(index),
    name: name || "Layer",
    visible: true,
    isLocked: false,
    isNameDynamic: false,
    rotation: round(rotation),
    rect: {
      location: { x: round(rect.x), y: round(rect.y) },
      size: {
        width: Math.max(1, round(rect.width)),
        height: Math.max(1, round(rect.height)),
      },
    },
    resizingConstraints: {
      hasFixedLeft: true,
      hasFixedRight: false,
      hasFixedTop: true,
      hasFixedBottom: false,
      hasFixedWidth: true,
      hasFixedHeight: true,
    },
    opacity: 1,
    textAlignment: 0,
    textPadding: [],
    effects: [],
    textShadows: [],
    booleanOperation: 0,
    textRotation: 0,
    isMask: false,
  });

  const shapeItem = (index, rect, name, options) => ({
    ...baseItem(index, rect, name, options.rotation || 0),
    corners: options.corners || [0, 0, 0, 0],
    border: options.border || [0, 0, 0, 0],
    backgroundFills: options.fills || [],
    strokes: options.strokes || [],
    strokePattern: [],
    strokeThickness: Math.max(0, round(options.strokeThickness || 0)),
  });

  const textItem = (index, rect, name, text) => ({
    ...baseItem(index, rect, name),
    isNameDynamic: true,
    backgroundFills: [],
    strokes: [],
    strokePattern: [],
    strokeThickness: 0,
    border: [0, 0, 0, 0],
    corners: [0, 0, 0, 0],
    textAlignment: 0,
    textPadding: [0, 0, 0, 0],
    text,
  });

  const alignMap = { left: 0, start: 0, center: 1, right: 2, end: 2, justify: 3 };
  const weightName = (weight) => {
    if (weight <= 100) return "Thin";
    if (weight <= 200) return "ExtraLight";
    if (weight <= 300) return "Light";
    if (weight <= 400) return "Regular";
    if (weight <= 500) return "Medium";
    if (weight <= 600) return "SemiBold";
    if (weight <= 700) return "Bold";
    if (weight <= 800) return "ExtraBold";
    return "Black";
  };
  const fontWeights = (value, family) => {
    const text = String(value || "").trim().toLowerCase();
    if (text === "normal" || text === "") return 400;
    if (text === "bold") return 700;
    if (text === "lighter") return 300;
    if (text === "bolder") return 700;
    const lowerFamily = String(family || "").toLowerCase();
    const familyWeight = lowerFamily.includes("black")
      ? 900
      : lowerFamily.includes("bold")
        ? 700
        : lowerFamily.includes("medium")
          ? 500
          : 400;
    const numeric = unit(text, familyWeight || 400);
    return Math.round(Math.max(100, Math.min(950, numeric || 400)) / 50) * 50;
  };

  const firstFamily = (value) => {
    const list = String(value || "").match(/(?:"[^"]+"|'[^']+'|[^,\s][^,]*)/g) || [];
    const first = (list[0] || "").replace(/^["']|["']$/g, "").trim();
    return first || "sans-serif";
  };

  async function fetchBlob(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      return await response.blob();
    } catch {
      return null;
    }
  }

  const readAsDataUrl = (blob) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    });

  function loadImage(url) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = url;
    });
  }

  async function rasterizeToPng(blob, scale = 1) {
    const objectUrl = URL.createObjectURL(blob);
    try {
      const image = await loadImage(objectUrl);
      if (!image) return null;
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
      canvas.height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
      const context = canvas.getContext("2d");
      if (!context) return null;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return `data:image/png;base64,${canvas.toDataURL("image/png").split(",")[1]}`;
    } catch {
      return null;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function imageDataUrl(blob, scale = 1) {
    // Axure 只稳定识别 png/jpeg/gif，其余（webp/svg）先栅格化为 png
    if (/image\/(png|jpeg|jpg|gif)/i.test(blob.type)) return readAsDataUrl(blob);
    return (await rasterizeToPng(blob, scale)) || readAsDataUrl(blob);
  }

  async function hashText(text) {
    try {
      const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    } catch {
      let hash = 2166136261;
      for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
      return (hash >>> 0).toString(16);
    }
  }

  const imageMap = {};
  async function storeDataUrl(dataUrl) {
    const commaIndex = dataUrl.indexOf(",");
    if (commaIndex < 0) return null;
    const base64 = dataUrl.slice(commaIndex + 1).replace(/\s+/g, "");
    if (!base64) return null;
    const key = await hashText(base64);
    imageMap[key] = base64;
    return key;
  }

  async function registerImage(url) {
    if (!url) return null;
    const absolute = new URL(url, document.baseURI).href;
    const blob = await fetchBlob(absolute);
    if (!blob || !blob.type.startsWith("image/")) return null;
    return storeDataUrl(await imageDataUrl(blob, 2));
  }

  // 内联 <svg>（图标）不在图片请求里，需要序列化后栅格化为 PNG 再作为图片填充
  async function registerSvg(svg, rect) {
    const clone = svg.cloneNode(true);
    const color = window.getComputedStyle(svg).color;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    if (!clone.getAttribute("width")) clone.setAttribute("width", String(Math.max(1, Math.round(rect.width))));
    if (!clone.getAttribute("height")) clone.setAttribute("height", String(Math.max(1, Math.round(rect.height))));
    for (const node of [clone, ...clone.querySelectorAll("*")]) {
      for (const attribute of ["fill", "stroke", "stop-color", "flood-color", "color"]) {
        const value = node.getAttribute(attribute);
        if (value && value.toLowerCase().includes("currentcolor")) {
          node.setAttribute(attribute, color);
        }
      }
    }
    const markup = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
    const dataUrl = await rasterizeToPng(blob, 2);
    if (!dataUrl) return null;
    return storeDataUrl(dataUrl);
  }

  function imageFill(key, pattern = 6) {
    return {
      type: 3,
      enabled: true,
      image: key,
      isHash: true,
      patternFillType: pattern,
      alignment: { horizontal: 1, vertical: 1 },
    };
  }

  function firstBackgroundUrl(value) {
    const match = String(value || "").match(/url\((['"]?)(.*?)\1\)/);
    return match ? match[2] : "";
  }

  function linearGradient(value) {
    const text = String(value || "");
    if (!text.toLowerCase().startsWith("linear-gradient")) return null;
    const angleMatch = text.match(/(?:^|,)\s*(-?\d+(?:\.\d+)?)deg/);
    const angle = angleMatch ? unit(angleMatch[1], 180) : 180;
    const stops = text.match(/(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8})/g) || [];
    if (stops.length < 2) return null;
    const colors = stops.map(parseColor).filter(Boolean);
    if (colors.length < 2) return null;
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
      type: 2,
      enabled: true,
      gradientType: 0,
      from: { x: round(0.5 - Math.cos(radians) / 2), y: round(0.5 - Math.sin(radians) / 2) },
      to: { x: round(0.5 + Math.cos(radians) / 2), y: round(0.5 + Math.sin(radians) / 2) },
      stops: colors.map((color, index) => ({
        offset: round(index / (colors.length - 1)),
        color,
      })),
    };
  }

  function isSkippedElement(element) {
    return ["SCRIPT", "STYLE", "LINK", "META", "TEMPLATE", "NOSCRIPT", "HEAD", "OPTION"].includes(
      element.tagName
    );
  }

  function isVisible(styles, rect) {
    if (!rect || rect.width <= 0 || rect.height <= 0) return false;
    if (styles.display === "none" || styles.visibility === "hidden") return false;
    if (unit(styles.opacity, 1) <= 0) return false;
    return true;
  }

  // 只保留滚动容器和画布视口内的可见区域，避免把滚出视口的列表数据也复制进去
  function intersectRect(rect, clip) {
    if (!clip) return rect;
    const left = Math.max(rect.x, clip.x);
    const top = Math.max(rect.y, clip.y);
    const right = Math.min(rect.x + rect.width, clip.x + clip.width);
    const bottom = Math.min(rect.y + rect.height, clip.y + clip.height);
    if (right - left <= 0.5 || bottom - top <= 0.5) return null;
    return { x: left, y: top, width: right - left, height: bottom - top };
  }

  // 逐字符取位置再按行分组：行内元素（如跨行 <code>）用整体包围盒会串行错位
  function textLines(node, origin, scale, clip) {
    const raw = String(node.textContent || "");
    if (!raw.trim()) return [];
    const range = document.createRange();
    const lines = [];
    let current = null;

    for (let index = 0; index < raw.length; index += 1) {
      range.setStart(node, index);
      range.setEnd(node, index + 1);
      const rect = range.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        if (current) current.text += raw[index];
        continue;
      }
      if (!current || Math.abs(rect.top - current.top) > 3) {
        current = {
          text: raw[index],
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        };
        lines.push(current);
      } else {
        current.text += raw[index];
        current.left = Math.min(current.left, rect.left);
        current.right = Math.max(current.right, rect.right);
        current.bottom = Math.max(current.bottom, rect.bottom);
      }
    }

    return lines
      .map((line) => {
        const text = line.text.replace(/\s+/g, " ").trim();
        // 换算回未缩放的画布坐标，并裁掉滚动容器外不可见的文本
        const box = intersectRect(
          {
            x: (line.left - origin.x) / scale,
            y: (line.top - origin.y) / scale,
            width: (line.right - line.left) / scale + 6,
            height: (line.bottom - line.top) / scale + 2,
          },
          clip
        );
        return text && box ? { text, ...box } : null;
      })
      .filter(Boolean);
  }

  async function buildScene(container, origin, bounds, scale) {
    const items = [];
    let index = 0;
    let skippedImages = 0;

    const pushShape = (rect, name, styles, rotation = 0, fullRect = rect) => {
      // blur/drop-shadow 是装饰性阴影，Axure 不支持的滤镜会渲染成实心黑块，直接跳过
      if (/blur\(|drop-shadow\(/.test(String(styles.filter || ""))) return;
      const color = parseColor(styles.backgroundColor);
      const gradient = linearGradient(styles.backgroundImage);
      const allSides = [
        { edge: "top", width: unit(styles.borderTopWidth), color: parseColor(styles.borderTopColor) },
        { edge: "right", width: unit(styles.borderRightWidth), color: parseColor(styles.borderRightColor) },
        { edge: "bottom", width: unit(styles.borderBottomWidth), color: parseColor(styles.borderBottomColor) },
        { edge: "left", width: unit(styles.borderLeftWidth), color: parseColor(styles.borderLeftColor) },
      ];
      const sides = allSides.filter((side) => side.width > 0.5 && side.color && side.color.a > 0);
      // 只有四边等宽时才用整体描边；像 border-top 这类单边分割线转成整框会凭空多出三边
      const uniformBorder =
        sides.length === 4 && sides.every((side) => Math.abs(side.width - sides[0].width) < 0.5);
      const hasFill = (color && color.a > 0) || gradient;
      if (!hasFill && sides.length === 0) return;

      const corners = [
        cornerRadius(styles.borderTopLeftRadius, rect.width, rect.height),
        cornerRadius(styles.borderTopRightRadius, rect.width, rect.height),
        cornerRadius(styles.borderBottomRightRadius, rect.width, rect.height),
        cornerRadius(styles.borderBottomLeftRadius, rect.width, rect.height),
      ];
      const fills = [];
      if (color && color.a > 0) fills.push(solidFill(color));
      if (gradient) fills.push(gradient);

      if (hasFill || uniformBorder) {
        items.push(
          shapeItem(++index, rect, name, {
            rotation,
            corners,
            border: uniformBorder ? [1, 1, 1, 1] : [0, 0, 0, 0],
            fills,
            // strokes 的每一项必须是 { fill: Fill }，直接放 Fill 会被 Axure 丢弃并回退到默认灰色
            strokes: uniformBorder ? [{ fill: solidFill(sides[0].color) }] : [],
            strokeThickness: uniformBorder ? sides[0].width : 0,
          })
        );
      }

      if (uniformBorder) return;

      // 非等宽描边逐边用细长形状还原，位置基于未被裁剪的原始尺寸
      for (const side of sides) {
        const thickness = Math.max(1, side.width);
        const lineRect =
          side.edge === "top"
            ? { x: fullRect.x, y: fullRect.y, width: fullRect.width, height: thickness }
            : side.edge === "bottom"
              ? { x: fullRect.x, y: fullRect.y + fullRect.height - thickness, width: fullRect.width, height: thickness }
              : side.edge === "left"
                ? { x: fullRect.x, y: fullRect.y, width: thickness, height: fullRect.height }
                : { x: fullRect.x + fullRect.width - thickness, y: fullRect.y, width: thickness, height: fullRect.height };
        const visibleLine = intersectRect(lineRect, rect);
        if (!visibleLine) continue;
        items.push(
          shapeItem(++index, visibleLine, `${name} 描边`, {
            rotation,
            fills: [solidFill(side.color)],
          })
        );
      }
    };

    const pushText = (rawText, parentStyles, rect, name, forcedColor = null) => {
      const raw = String(rawText || "").replace(/\s+/g, " ").trim();
      if (!raw) return;
      const fontSize = Math.max(1, Math.round(unit(parentStyles.fontSize, 16)));
      const lineHeightRaw = parentStyles.lineHeight;
      const lineSpacing =
        lineHeightRaw === "normal"
          ? Math.round(fontSize * 1.2)
          : Math.max(fontSize, Math.round(unit(lineHeightRaw, fontSize * 1.2)));
      const family = firstFamily(parentStyles.fontFamily);
      const weight = fontWeights(parentStyles.fontWeight, family);
      const color = forcedColor || parseColor(parentStyles.color) || { r: 0, g: 0, b: 0, a: 1 };
      const decoration = `${parentStyles.textDecorationLine || ""} ${parentStyles.textDecoration || ""}`.toLowerCase();
      const style = /italic|oblique/i.test(parentStyles.fontStyle || "") ? 1 : 0;
      const transform =
        parentStyles.textTransform === "uppercase"
          ? 1
          : parentStyles.textTransform === "lowercase"
            ? 2
            : 0;

      items.push(
        textItem(++index, rect, name, {
          paragraphs: [
            {
              horizontalAlignment: alignMap[parentStyles.textAlign] ?? 0,
              lineSpacing,
              inlines: [
                {
                  type: 0,
                  text: raw,
                  family,
                  typeface: `${family} - ${weightName(weight)}`,
                  weight,
                  stretch: 5,
                  size: fontSize,
                  textColor: color,
                  style,
                  underline: decoration.includes("underline"),
                  strikethrough: decoration.includes("line-through"),
                  characterSpacing: Math.round(unit(parentStyles.letterSpacing)),
                  transform,
                },
              ],
            },
          ],
        })
      );
    };

    async function visit(element, clip) {
      if (isSkippedElement(element)) return;
      const styles = window.getComputedStyle(element);
      const rawRect = element.getBoundingClientRect();
      const visible = isVisible(styles, rawRect);
      const rotation = rotationOf(styles);
      // getBoundingClientRect 得到的是缩放后的屏幕坐标，这里统一换算回 1920×1080 画布坐标
      let rect = {
        x: (rawRect.left - origin.x) / scale,
        y: (rawRect.top - origin.y) / scale,
        width: rawRect.width / scale,
        height: rawRect.height / scale,
      };
      if (rotation) {
        // 旋转元素的 boundingRect 是外接矩形，需要换回未旋转的尺寸
        const width = element.offsetWidth || rawRect.width / scale;
        const height = element.offsetHeight || rawRect.height / scale;
        rect = {
          x: rect.x + rect.width / 2 - width / 2,
          y: rect.y + rect.height / 2 - height / 2,
          width,
          height,
        };
      }
      // 视口和滚动容器之外的内容不复制，只保留当前屏幕上真正可见的区域
      const clipped = intersectRect(rect, clip);
      const tag = element.tagName.toLowerCase();
      const name =
        element.getAttribute("aria-label") ||
        element.getAttribute("data-name") ||
        (tag === "img" ? element.getAttribute("alt") || "Image" : tag);

      if (!visible) {
        // 仍要遍历子节点，避免父级透明背景导致内容全部丢失
        if (styles.display === "none") return;
      }

      if (visible && element !== container) {
        if (tag === "svg") {
          const key = clipped ? await registerSvg(element, rect) : null;
          if (key) {
            items.push(shapeItem(++index, rect, name, { rotation, fills: [imageFill(key)] }));
          } else if (clipped) {
            skippedImages += 1;
          }
          return;
        }

        if (tag === "img" && element.currentSrc) {
          const key = clipped ? await registerImage(element.currentSrc) : null;
          if (key) {
            items.push(
              shapeItem(++index, rect, name, {
                rotation,
                fills: [imageFill(key)],
              })
            );
          } else if (clipped) {
            skippedImages += 1;
          }
          return;
        }

        if (clipped) {
          const backgroundUrl = firstBackgroundUrl(styles.backgroundImage);
          // 行内元素（如 <code> 高亮块）跨行时包围盒会覆盖其它文字，跳过其背景形状
          if (styles.display === "inline") {
            // 行内元素不生成填充形状，仍继续处理其文字内容
          } else if (backgroundUrl) {
            const key = await registerImage(backgroundUrl);
            if (key) {
              items.push(shapeItem(++index, rect, name, { rotation, fills: [imageFill(key)] }));
              pushShape(clipped, `${name} 底色`, styleSnapshot(styles, { backgroundImage: "none" }), rotation, rect);
            } else {
              skippedImages += 1;
              pushShape(clipped, name, styles, rotation, rect);
            }
          } else {
            pushShape(clipped, name, styles, rotation, rect);
          }
        }
      }

      if (visible) {
        // 输入框/下拉框的可见文字不是 DOM 文本节点，需要主动读取 value / placeholder
        if (tag === "input" || tag === "textarea" || tag === "select") {
          const value =
            tag === "select"
              ? String(element.options?.[element.selectedIndex]?.text || "")
              : String(element.value || "");
          const placeholder = String(element.getAttribute("placeholder") || "");
          const text = (value || placeholder).trim();
          if (text && clipped) {
            const box = fieldTextBox(clipped, styles);
            pushText(
              text,
              styles,
              box,
              value ? "输入内容" : "占位内容",
              value ? null : placeholderColor(element, styles)
            );
          }
        }
        for (const node of Array.from(element.childNodes)) {
          if (node.nodeType !== Node.TEXT_NODE) continue;
          if (!String(node.textContent || "").trim()) continue;
          for (const line of textLines(node, origin, scale, clip)) {
            pushText(line.text, styles, line, `文本 ${index + 1}`);
          }
        }
      }

      // 沿 overflow 祖先逐层裁剪，滚出可视区域的列表数据不会再被复制
      let childClip = clip;
      if (element !== container && /(auto|scroll|hidden|clip)/.test(`${styles.overflowX}${styles.overflowY}`)) {
        const box = intersectRect(
          {
            x: rect.x + element.clientLeft,
            y: rect.y + element.clientTop,
            width: element.clientWidth,
            height: element.clientHeight,
          },
          clip
        );
        childClip = box || { x: 0, y: 0, width: 0, height: 0 };
      }

      // 按 CSS 绘制顺序：定位元素（absolute/fixed/sticky）应盖在静态兄弟元素之上
      const staticChildren = [];
      const positionedChildren = [];
      for (const child of Array.from(element.children)) {
        const childStyles = window.getComputedStyle(child);
        (childStyles.position === "static" ? staticChildren : positionedChildren).push(child);
      }
      for (const child of [...staticChildren, ...positionedChildren]) {
        await visit(child, childClip);
      }
    }

    await visit(container, { x: 0, y: 0, width: bounds.width, height: bounds.height });

    if (bounds) {
      items.unshift(
        shapeItem(++index, { x: 0, y: 0, width: bounds.width, height: bounds.height }, "页面背景", {
          fills: [solidFill({ r: 1, g: 1, b: 1, a: 1 })],
        })
      );
    }

    return { items, skippedImages };
  }

  async function waitForAssets() {
    if (document.fonts?.ready) {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
    }
    const images = Array.from(document.querySelectorAll("img"));
    await Promise.allSettled(
      images.map((image) => {
        if (image.complete) return Promise.resolve();
        return new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
          setTimeout(resolve, 3000);
        });
      })
    );
  }

  try {
    const container = document.querySelector(selector);
    if (!container) throw new Error(`找不到复制区域：${selector}`);

    await waitForAssets();
    await new Promise((resolve) => setTimeout(resolve, 150));

    const origin = container.getBoundingClientRect();
    // 工作台会等比缩放画布，这里用未缩放的布局尺寸反推缩放比例
    const scale = container.clientWidth ? origin.width / container.clientWidth : 1;
    const bounds = {
      width: container.clientWidth || origin.width,
      height: container.clientHeight || origin.height,
    };
    const { items, skippedImages } = await buildScene(container, origin, bounds, scale);

    // 直接以控件形式写入 scene：不再包一层遮罩画板，避免 Axure 粘贴后变成动态面板
    const payload = {
      masters: {},
      imageMap,
      scene: { items },
    };

    const response = await fetch(`${bridge}/copyaxvg`, {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: `// axvg\n${JSON.stringify(payload)}`,
    });

    if (!response.ok) {
      throw new Error(`Axure 复制接口返回 ${response.status}`);
    }

    return {
      success: true,
      itemCount: items.length,
      width: Math.round(bounds.width),
      height: Math.round(bounds.height),
      skippedImages,
    };
  } catch (error) {
    console.error("[copyToAxure] failed:", error);
    throw error;
  }
});
