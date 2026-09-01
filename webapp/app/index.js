import { BinaryImageConverter, ColorImageConverter } from 'vtracer';

let runner = null;
const canvas = document.getElementById('frame');
const ctx = canvas.getContext('2d');
const svg = document.getElementById('svg');
const img = new Image();
const progress = document.getElementById('progressbar');
const progressregion = document.getElementById('progressregion');
const canvasContainer = document.getElementById('canvas-container');
const droptext = document.getElementById('droptext');
const toastEl = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
const imageMeta = document.getElementById('imageMeta');

// 状态参数
let mode = 'spline'; // 'spline' | 'polygon' | 'none'
let clustering_mode = 'color'; // 'color' | 'binary'
let clustering_hierarchical = 'stacked'; // 'stacked' | 'cutout'
let viewMode = 'svg'; // 'svg' | 'original' | 'blend'

// 数值参数
let globalCorner = 60;
let globalLength = 4.0;
let globalSplice = 45;
let globalFilterSpeckle = 4;
let globalColorPrecision = 7;
let globalLayerDifference = 16;
let globalPathPrecision = 8;

// Toast 提示
function showToast(message) {
    toastMsg.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 2000);
}

// 预设配置
const presets = {
    illustration: {
        name: '彩色插画',
        mode: 'spline',
        clustering_mode: 'color',
        clustering_hierarchical: 'stacked',
        filter_speckle: 4,
        color_precision: 7,
        layer_difference: 16,
        corner_threshold: 60,
        length_threshold: 4.0,
        splice_threshold: 45,
        path_precision: 8,
    },
    bw: {
        name: '黑白线稿',
        mode: 'spline',
        clustering_mode: 'binary',
        clustering_hierarchical: 'stacked',
        filter_speckle: 2,
        color_precision: 6,
        layer_difference: 16,
        corner_threshold: 60,
        length_threshold: 3.5,
        splice_threshold: 45,
        path_precision: 8,
    },
    pixel: {
        name: '像素艺术',
        mode: 'none',
        clustering_mode: 'color',
        clustering_hierarchical: 'stacked',
        filter_speckle: 1,
        color_precision: 8,
        layer_difference: 0,
        corner_threshold: 180,
        length_threshold: 4.0,
        splice_threshold: 45,
        path_precision: 8,
    },
    poster: {
        name: '扁平海报',
        mode: 'spline',
        clustering_mode: 'color',
        clustering_hierarchical: 'cutout',
        filter_speckle: 8,
        color_precision: 6,
        layer_difference: 32,
        corner_threshold: 45,
        length_threshold: 5.0,
        splice_threshold: 60,
        path_precision: 6,
    },
    photo: {
        name: '细腻照片',
        mode: 'spline',
        clustering_mode: 'color',
        clustering_hierarchical: 'stacked',
        filter_speckle: 8,
        color_precision: 8,
        layer_difference: 12,
        corner_threshold: 90,
        length_threshold: 4.0,
        splice_threshold: 45,
        path_precision: 8,
    }
};

function applyPreset(presetKey) {
    const config = presets[presetKey];
    if (!config) return;

    mode = config.mode;
    clustering_mode = config.clustering_mode;
    clustering_hierarchical = config.clustering_hierarchical;
    globalCorner = config.corner_threshold;
    globalLength = config.length_threshold;
    globalSplice = config.splice_threshold;
    globalFilterSpeckle = config.filter_speckle;
    globalColorPrecision = config.color_precision;
    globalLayerDifference = config.layer_difference;
    globalPathPrecision = config.path_precision;

    updateUIFromState();
    restart();
    showToast(`预设已切换: ${config.name}`);
}

function updateUIFromState() {
    // 聚类模式
    document.getElementById('clustering-color').classList.toggle('active', clustering_mode === 'color');
    document.getElementById('clustering-binary').classList.toggle('active', clustering_mode === 'binary');

    // 图层模式
    document.getElementById('clustering-stacked').classList.toggle('active', clustering_hierarchical === 'stacked');
    document.getElementById('clustering-cutout').classList.toggle('active', clustering_hierarchical === 'cutout');

    // 曲线模式
    document.getElementById('spline').classList.toggle('active', mode === 'spline');
    document.getElementById('polygon').classList.toggle('active', mode === 'polygon');
    document.getElementById('none').classList.toggle('active', mode === 'none');

    // 选项可见性
    Array.from(document.getElementsByClassName('clustering-color-options')).forEach(el => {
        el.style.display = clustering_mode === 'color' ? '' : 'none';
    });
    Array.from(document.getElementsByClassName('spline-options')).forEach(el => {
        el.style.display = mode === 'spline' ? '' : 'none';
    });

    // 数值与滑块
    document.getElementById('filterspeckle').value = globalFilterSpeckle;
    document.getElementById('filterspecklevalue').textContent = globalFilterSpeckle;

    document.getElementById('colorprecision').value = globalColorPrecision;
    document.getElementById('colorprecisionvalue').textContent = globalColorPrecision;

    document.getElementById('layerdifference').value = globalLayerDifference;
    document.getElementById('layerdifferencevalue').textContent = globalLayerDifference;

    document.getElementById('corner').value = globalCorner;
    document.getElementById('cornervalue').textContent = globalCorner + '°';

    document.getElementById('length').value = globalLength;
    document.getElementById('lengthvalue').textContent = Number(globalLength).toFixed(1);

    document.getElementById('splice').value = globalSplice;
    document.getElementById('splicevalue').textContent = globalSplice + '°';

    document.getElementById('pathprecision').value = globalPathPrecision;
    document.getElementById('pathprecisionvalue').textContent = globalPathPrecision;
}

// 预设绑定
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        applyPreset(this.dataset.preset);
    });
});

// 分段选择器绑定
document.getElementById('clustering-color').addEventListener('click', () => {
    clustering_mode = 'color';
    updateUIFromState();
    restart();
});

document.getElementById('clustering-binary').addEventListener('click', () => {
    clustering_mode = 'binary';
    updateUIFromState();
    restart();
});

document.getElementById('clustering-stacked').addEventListener('click', () => {
    clustering_hierarchical = 'stacked';
    updateUIFromState();
    restart();
});

document.getElementById('clustering-cutout').addEventListener('click', () => {
    clustering_hierarchical = 'cutout';
    updateUIFromState();
    restart();
});

document.getElementById('spline').addEventListener('click', () => {
    mode = 'spline';
    updateUIFromState();
    restart();
});

document.getElementById('polygon').addEventListener('click', () => {
    mode = 'polygon';
    updateUIFromState();
    restart();
});

document.getElementById('none').addEventListener('click', () => {
    mode = 'none';
    updateUIFromState();
    restart();
});

// 滑块绑定
function bindSlider(id, valId, suffix = '', isFloat = false, onChangeCallback) {
    const slider = document.getElementById(id);
    const valDisplay = document.getElementById(valId);

    slider.addEventListener('input', function () {
        const val = isFloat ? parseFloat(this.value).toFixed(1) : this.value;
        valDisplay.textContent = val + suffix;
    });

    slider.addEventListener('change', function () {
        onChangeCallback(isFloat ? parseFloat(this.value) : parseInt(this.value, 10));
        restart();
    });
}

bindSlider('filterspeckle', 'filterspecklevalue', '', false, v => globalFilterSpeckle = v);
bindSlider('colorprecision', 'colorprecisionvalue', '', false, v => globalColorPrecision = v);
bindSlider('layerdifference', 'layerdifferencevalue', '', false, v => globalLayerDifference = v);
bindSlider('corner', 'cornervalue', '°', false, v => globalCorner = v);
bindSlider('length', 'lengthvalue', '', true, v => globalLength = v);
bindSlider('splice', 'splicevalue', '°', false, v => globalSplice = v);
bindSlider('pathprecision', 'pathprecisionvalue', '', false, v => globalPathPrecision = v);

// 视图切换
function applyViewMode(newMode) {
    viewMode = newMode;
    document.getElementById('viewSvg').classList.toggle('active', viewMode === 'svg');
    document.getElementById('viewOriginal').classList.toggle('active', viewMode === 'original');
    document.getElementById('viewBlend').classList.toggle('active', viewMode === 'blend');

    if (viewMode === 'svg') {
        svg.style.display = 'block';
        svg.style.opacity = '1';
        canvas.style.display = 'none';
    } else if (viewMode === 'original') {
        svg.style.display = 'none';
        canvas.style.display = 'block';
        canvas.style.opacity = '1';
    } else if (viewMode === 'blend') {
        svg.style.display = 'block';
        svg.style.opacity = '0.6';
        canvas.style.display = 'block';
        canvas.style.opacity = '0.5';
    }
}

document.getElementById('viewSvg').addEventListener('click', () => applyViewMode('svg'));
document.getElementById('viewOriginal').addEventListener('click', () => applyViewMode('original'));
document.getElementById('viewBlend').addEventListener('click', () => applyViewMode('blend'));

// 上传交互
const imageInput = document.getElementById('imageInput');
const imageSelect = document.getElementById('imageSelect');
const reUploadBtn = document.getElementById('reUploadBtn');
const drop = document.getElementById('drop');

imageSelect.addEventListener('click', (e) => {
    e.preventDefault();
    imageInput.click();
});

reUploadBtn.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
        loadImage(this.files[0]);
    }
});

// 粘贴
document.addEventListener('paste', function (e) {
    if (e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                loadImage(blob);
                showToast('已从剪贴板载入图片');
                e.preventDefault();
                return;
            }
        }
    }
});

// 拖拽
drop.addEventListener('dragenter', (e) => {
    e.preventDefault();
    droptext.classList.add('hovering');
});

drop.addEventListener('dragover', (e) => {
    e.preventDefault();
    droptext.classList.add('hovering');
});

drop.addEventListener('dragleave', (e) => {
    e.preventDefault();
    droptext.classList.remove('hovering');
});

drop.addEventListener('drop', (e) => {
    e.preventDefault();
    droptext.classList.remove('hovering');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        loadImage(e.dataTransfer.files[0]);
    }
});

// 加载图片
function loadImage(source) {
    const srcUrl = source instanceof File || source instanceof Blob ? URL.createObjectURL(source) : source;
    img.src = srcUrl;
    img.onload = function () {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        canvas.width = width;
        canvas.height = height;
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        droptext.style.display = 'none';
        canvasContainer.style.display = 'flex';

        if (imageMeta) {
            imageMeta.textContent = `${width} × ${height} px · 矢量渲染中...`;
        }

        restart();
    };
}

// 执行矢量化转换
function restart() {
    if (!img.src || !img.naturalWidth) {
        return;
    }

    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const converter_params = JSON.stringify({
        'canvas_id': canvas.id,
        'svg_id': svg.id,
        'mode': mode,
        'clustering_mode': clustering_mode,
        'hierarchical': clustering_hierarchical,
        'corner_threshold': deg2rad(globalCorner),
        'length_threshold': globalLength,
        'max_iterations': 10,
        'splice_threshold': deg2rad(globalSplice),
        'filter_speckle': globalFilterSpeckle * globalFilterSpeckle,
        'color_precision': 8 - globalColorPrecision,
        'layer_difference': globalLayerDifference,
        'path_precision': globalPathPrecision,
    });

    if (runner) {
        runner.stop();
    }

    try {
        runner = new ConverterRunner(converter_params);
        progress.value = 0;
        progressregion.style.display = 'block';
        runner.run();
    } catch (err) {
        console.error('转换失败:', err);
        showToast('转换失败，请检查参数');
    }
}

function deg2rad(deg) {
    return deg / 180 * Math.PI;
}

class ConverterRunner {
    constructor(converter_params) {
        this.converter =
            clustering_mode === 'color' ?
                ColorImageConverter.new_with_string(converter_params) :
                BinaryImageConverter.new_with_string(converter_params);
        this.converter.init();
        this.stopped = false;

        if (clustering_mode === 'binary') {
            svg.style.background = '#ffffff';
        } else {
            svg.style.background = '';
        }
        applyViewMode(viewMode);
    }

    run() {
        const self = this;
        setTimeout(function tick() {
            if (!self.stopped) {
                let done = false;
                const startTick = performance.now();
                while (!(done = self.converter.tick()) && (performance.now() - startTick < 25)) {
                }
                const p = self.converter.progress();
                progress.value = p;

                if (done || p >= 100) {
                    progressregion.style.display = 'none';
                    progress.value = 0;
                    applyViewMode(viewMode);
                    if (imageMeta && img.naturalWidth) {
                        const pathCount = svg.querySelectorAll('path').length;
                        imageMeta.textContent = `${img.naturalWidth} × ${img.naturalHeight} px · ${pathCount} 条矢量路径`;
                    }
                } else {
                    setTimeout(tick, 1);
                }
            }
        }, 1);
    }

    stop() {
        this.stopped = true;
        if (this.converter) {
            this.converter.free();
        }
    }
}

// 导出与下载 SVG
document.getElementById('export').addEventListener('click', function (e) {
    if (!svg.firstChild) {
        showToast('请先加载图片');
        e.preventDefault();
        return;
    }

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Generator: VTracer Studio -->\n` +
        new XMLSerializer().serializeToString(svg);

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);

    this.href = url;
    this.target = '_blank';
    this.download = `vector-${Date.now()}.svg`;
    showToast('SVG 已开始下载');
});

// 复制 SVG 源码
document.getElementById('copySvgBtn').addEventListener('click', function () {
    if (!svg.firstChild) {
        showToast('请先加载图片');
        return;
    }

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Generator: VTracer Studio -->\n` +
        new XMLSerializer().serializeToString(svg);

    navigator.clipboard.writeText(svgContent)
        .then(() => {
            showToast('SVG 代码已复制到剪贴板');
        })
        .catch(err => {
            console.error(err);
            showToast('复制失败');
        });
});

// 快捷键支持 (Ctrl+S / Cmd+S 快速下载)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        document.getElementById('export').click();
    }
});

// 初始化
updateUIFromState();