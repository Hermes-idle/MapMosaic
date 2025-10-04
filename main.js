// 主应用程序
class MapMosaic {
    constructor() {
        this.map = null;
        this.markers = [];
        this.currentColor = '#ff6b6b';
        this.pixelCount = 0;
        this.isDrawing = false;
        
        this.presetColors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
            '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
            '#10ac84', '#ee5a24', '#0984e3', '#a29bfe', '#fd79a8'
        ];
        
        this.init();
    }
    
    init() {
        this.initMap();
        this.initUI();
        this.initEvents();
        this.hideLoading();
    }
    
    initMap() {
        // 使用简洁的深色地图
        this.map = L.map('map', {
            zoomControl: false,
            attributionControl: false
        }).setView([30, 110], 3);
        
        // 使用CartoDB的深色地图（类似wplace.live的风格）
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap, © CartoDB',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(this.map);
        
        // 自定义缩放控件
        L.control.zoom({
            position: 'bottomright'
        }).addTo(this.map);
    }
    
    initUI() {
        this.renderColorGrid();
        this.updateStats();
        this.initCoordinateTracking();
    }
    
    renderColorGrid() {
        const colorGrid = document.getElementById('colorGrid');
        colorGrid.innerHTML = '';
        
        this.presetColors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = `color-option ${color === this.currentColor ? 'active'