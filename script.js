// ===================================================================================
// AlbedoFlow - PBR Texture Generator
// Desenvolvido por: Paulo061/codvision
// Versão Final: 1.2
// ===================================================================================

// Script de Segurança
(() => {
    const ALLOWED_DOMAIN = 'codvision.github.io';
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal && window.location.hostname !== ALLOWED_DOMAIN) {
        window.location.href = `https://${ALLOWED_DOMAIN}/albedoflow/`;
    }
    if (!isLocal && window.top !== window.self) {
        try {
            window.top.location.replace(`https://${ALLOWED_DOMAIN}/albedoflow/`);
        } catch (e) { console.error("Frame-busting failed:", e); }
    }
})();

// Importações do Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ===================================================================================
// CONFIGURAÇÃO E CONSTANTES
// ===================================================================================

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mqadkyvd";
const ALL_MAP_TYPES = ["diffuse", "height", "normal", "curvature", "ao", "roughness", "metallic", "orm"];

const translations = {
    pt: {
        metaTitle: "AlbedoFlow - Gerador de Mapas de Textura PBR",
        metaDescription: "AlbedoFlow: Ferramenta online gratuita e otimizada para gerar mapas de textura PBR. Crie e ajuste mapas de Diffuse, Normal, Height, AO, e Curvatura com controles avançados e sem travamentos.",
        ogTitle: "AlbedoFlow - Gerador de Mapas de Textura PBR Online",
        ogDescription: "Crie e ajuste mapas de textura PBR (Diffuse, Normal, AO, etc.) de forma rápida e gratuita, diretamente no seu navegador com AlbedoFlow.",
        loaderProcessing: "Processando...",
        fullscreenTooltip: "Entrar/Sair da Tela Cheia",
        donateTooltip: "Apoie o Projeto",
        reportBugTooltip: "Reportar Erro ou Sugestão",
        termsTooltip: "Ver Termos de Uso",
        reportModalTitle: "Reportar Erro ou Sugestão",
        reportEmailLabel: "Seu Email (opcional, para contato)",
        reportMessageLabel: "Mensagem",
        reportClose: "Fechar",
        reportSend: "Enviar",
        reportSuccess: "Obrigado pelo seu feedback!",
        reportError: "Ocorreu um erro ao enviar. Tente novamente.",
        termsModalTitle: "Termos de Uso",
        termsModalBody: `<h4>1. Aceitação dos Termos</h4><p>Ao acessar e usar o AlbedoFlow ("o Serviço"), você aceita e concorda em estar vinculado aos termos e disposições deste acordo. O Serviço é fornecido gratuitamente para uso pessoal e comercial.</p><h4>2. Descrição do Serviço</h4><p>AlbedoFlow é uma ferramenta online que permite aos usuários gerar mapas de textura PBR (Physically Based Rendering) a partir de uma imagem base. Todo o processamento é feito localmente no seu navegador. Nenhum dado de imagem é enviado para qualquer servidor durante o processo de geração de textura.</p><h4>3. Conteúdo Enviado pelo Usuário</h4><p>Você é o único responsável pelas imagens que envia. Você afirma, representa e garante que possui ou tem as licenças, direitos, consentimentos e permissões necessárias para usar e autorizar o Serviço a usar suas imagens. Você concorda em não enviar qualquer conteúdo que seja ilegal, protegido por direitos autorais sem permissão ou malicioso.</p><h4>4. Conteúdo Gerado</h4><p>Você retém todos os direitos de propriedade intelectual sobre os mapas de textura que gera usando o Serviço. Não reivindicamos nenhuma propriedade sobre suas imagens originais ou os mapas resultantes.</p><h4>5. Privacidade e Armazenamento de Dados</h4><p>O AlbedoFlow respeita sua privacidade. A ferramenta foi projetada para funcionar inteiramente no seu navegador:</p><ul><li><b>Processamento de Imagem:</b> Suas imagens são processadas localmente no seu computador e nunca são enviadas para nossos servidores.</li><li><b>Preferência de Idioma:</b> Para melhorar sua experiência, salvamos o idioma selecionado (Português ou Inglês) no <strong>localStorage</strong> do seu navegador. Este é um pequeno arquivo no seu computador que lembra sua escolha para a sua próxima visita. Nenhum dado pessoal é armazenado.</li><li><b>Relatórios de Erros e Sugestões:</b> Se você optar por enviar um relatório de erro ou sugestão usando o formulário de contato, as informações que você fornece (seu e-mail, se optar por compartilhá-lo, e sua mensagem) são enviadas para nós através do serviço de terceiros <a href="https://formspree.io/privacy" target="_blank" rel="noopener noreferrer">Formspree</a>. Esta é a única instância em que dados são transmitidos do site. Usamos essas informações exclusivamente com o propósito de nos comunicarmos com você sobre seu feedback e melhorar o Serviço.</li></ul><p>O site está hospedado no GitHub Pages. Você pode consultar a declaração de privacidade do GitHub para mais informações.</p><h4>6. Isenção de Garantias</h4><p>O Serviço é fornecido "como está". Não oferecemos garantia de que o Serviço atenderá às suas necessidades, será ininterrupto, pontual, seguro ou livre de erros. O uso do serviço é por sua conta e risco.</p><h4>7. Limitação de Responsabilidade</h4><p>Em nenhuma circunstância os desenvolvedores do AlbedoFlow serão responsáveis por quaisquer danos diretos, indiretos, incidentais, especiais ou consequenciais resultantes do uso ou da incapacidade de usar o serviço.</p><h4>8. Alterações nos Termos</h4><p>Reservamo-nos o direito de modificar estes termos de tempos em tempos, a nosso exclusivo critério. Portanto, você deve revisar esta página periodicamente.</p><p>Última atualização: 28 de agosto de 2025</p>`,
        termsClose: "Fechar",
        strengthTooltip: "Controla a profundidade e a intensidade dos detalhes do mapa. Valores mais altos criam relevos mais fortes.",
        invertYTooltip: "Inverte o canal verde. Use esta opção se a iluminação parecer vir da direção errada. (OpenGL vs. DirectX)",
        invertValuesTooltip: "Inverte os valores de preto e branco da textura. Útil para mapas como Roughness, onde branco pode significar áspero ou liso, dependendo do motor.",
        sharpenTooltip: "Realça as bordas e detalhes finos da imagem, tornando-a mais nítida.",
        smoothnessTooltip: "Aplica um desfoque suave para reduzir ruídos ou detalhes indesejados, resultando em uma superfície mais lisa.",
        levelsTooltip: "Ajusta a gama de tons da imagem, similar à ferramenta 'Levels' em softwares de edição de imagem.",
        blackPointTooltip: "Define o valor mais escuro da imagem. Todos os pixels mais escuros que este ponto se tornarão pretos.",
        whitePointTooltip: "Define o valor mais claro da imagem. Todos os pixels mais claros que este ponto se tornarão brancos.",
        gammaTooltip: "Ajusta os tons médios da imagem sem afetar os pontos preto e branco absolutos.",
        proceduralNoiseTooltip: "Adiciona ruído gerado proceduralmente à imagem para criar detalhes de superfície finos ou variações.",
        scaleTooltip: "Controla o tamanho e a frequência do padrão de ruído. Valores menores criam um ruído maior e mais espaçado.",
        noiseStrengthTooltip: "Define a visibilidade e a intensidade do ruído misturado à imagem.",
        blendModeTooltip: "Determina como o ruído será combinado com a imagem base (ex: adicionar, multiplicar, sobrepor).",
        kernel: "Filtro (Kernel)",
        kernelTooltip: "Define o algoritmo para calcular os detalhes da superfície. Scharr geralmente oferece resultados mais precisos que o Sobel.",
        sourceAdjustments: "Ajustes da Fonte (Height)",
        sourceSmoothness: "Suavizar Fonte",
        sourceSmoothnessTooltip: "Aplica um desfoque na imagem de altura *antes* de gerar o mapa normal, para reduzir ruído e obter transições mais suaves.",
        normalBlackPointTooltip: "Ajusta o ponto preto do mapa de altura usado como fonte, controlando quais áreas escuras são consideradas 'planas'.",
        normalWhitePointTooltip: "Ajusta o ponto branco do mapa de altura usado como fonte, controlando quais áreas claras atingem a 'altura' máxima.",
        normalGammaTooltip: "Ajusta os tons médios do mapa de altura usado como fonte, influenciando a curva de relevo sem alterar os extremos.",
        section1Title: "1. Configurações Globais",
        resolutionLabel: "Resolução de Saída",
        section2Title: "2. Imagem Base",
        selectImage: "Selecionar Imagem",
        noFileSelected: "Nenhum arquivo.",
        section3Title: "3. Mapas de Textura (Previews)",
        section4Title: "4. Ajustes e Ferramentas",
        section5Title: "5. Exportar",
        format: "Formato",
        quality: "Qualidade",
        baseFileNameLabel: "Nome Base do Arquivo",
        baseFileNamePlaceholder: "ex: textura_rocha",
        downloadMap: "Baixar Mapa Selecionado",
        downloadAll: "Baixar Todos (.zip)",
        generation: "Geração",
        strength: "Intensidade",
        invertY: "Inverter Eixo Y (Green)",
        invertValues: "Inverter Valores",
        sharpen: "Nitidez",
        smoothness: "Suavizar",
        levels: "Níveis (Levels)",
        blackPoint: "Ponto Preto",
        whitePoint: "Ponto Branco",
        gamma: "Gamma",
        proceduralNoise: "Ruído Procedural",
        scale: "Escala",
        blendMode: "Modo de Mesclagem",
        viewerOptions: "Opções de Visualização",
        model3d: "Modelo 3D",
        sphere: "Esfera",
        cube: "Cubo",
        cylinder: "Cilindro",
        torus: "Toro",
        plane: "Plano",
        meshQuality: "Qualidade da Malha",
        viewMesh: "Visualizar Malha",
        lighting: "Iluminação Ambiente (HDR/EXR)",
        exposure: "Exposição",
        tiling: "Repetição (Tiling)",
        displacement: "Deslocamento",
        developedBy: "Desenvolvido por:",
        studioLights: "Ativar Luzes de Estúdio",
        curvature: "Curvatura",
        curvatureDetails: "Nível de Detalhe",
        curvatureDetailsTooltip: "Controla a distância da amostragem para calcular a curvatura. Valores maiores capturam detalhes mais amplos.",
        curvatureMode: "Modo de Exibição",
        curvatureModeTooltip: "Filtra o mapa para mostrar bordas (convexas), fendas (côncavas) ou ambos.",
        modeBoth: "Ambos",
        modeEdges: "Apenas Bordas",
        modeCrevices: "Apenas Fendas",
        heightContrast: "Intensidade (Contraste)",
        heightContrastTooltip: "Aumenta ou diminui a diferença entre as áreas altas e baixas do relevo.",
        colorAdjustments: "Ajustes de Cor",
        brightness: "Brilho",
        brightnessTooltip: "Ajusta o brilho geral da imagem.",
        contrast: "Contraste",
        contrastTooltip: "Ajusta a diferença entre as áreas claras e escuras.",
        saturation: "Saturação",
        saturationTooltip: "Ajusta a intensidade das cores.",
        hue: "Matiz",
        hueTooltip: "Muda a tonalidade geral das cores da imagem.",
        generateMapsModalTitle: "Selecionar Mapas para Gerar",
        generateMapsModalDesc: "Escolha quais mapas de textura você deseja criar a partir da sua imagem base.",
        cancel: "Cancelar",
        generateMaps: "Gerar Mapas",
        toggleVisibilityTooltip: "Ativar ou desativar este mapa na visualização 3D",
        resetGroupTooltip: "Resetar este grupo de controles",
    },
    en: {
        metaTitle: "AlbedoFlow v2.4 - PBR Texture Map Generator",
        metaDescription: "AlbedoFlow: Free and optimized online tool to generate PBR texture maps. Create and adjust Diffuse, Normal, Height, AO, and Curvature maps with advanced controls and no lag.",
        ogTitle: "AlbedoFlow - Online PBR Texture Map Generator",
        ogDescription: "Create and adjust PBR texture maps (Diffuse, Normal, AO, etc.) quickly and for free, directly in your browser with AlbedoFlow.",
        loaderProcessing: "Processing...",
        fullscreenTooltip: "Enter/Exit Fullscreen",
        donateTooltip: "Support the Project",
        reportBugTooltip: "Report Bug or Suggestion",
        termsTooltip: "View Terms of Use",
        reportModalTitle: "Report a Bug or Suggestion",
        reportEmailLabel: "Your Email (optional, for follow-up)",
        reportMessageLabel: "Message",
        reportClose: "Close",
        reportSend: "Send",
        reportSuccess: "Thank you for your feedback!",
        reportError: "An error occurred while sending. Please try again.",
        termsModalTitle: "Terms of Use",
        // ***** INÍCIO DA CORREÇÃO *****
        termsModalBody: `<h4>1. Acceptance of Terms</h4><p>By accessing and using AlbedoFlow ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. The Service is provided free of charge for personal and commercial use.</p><h4>2. Description of Service</h4><p>AlbedoFlow is an online tool that allows users to generate PBR (Physically Based Rendering) texture maps from a base image. All processing is done locally in your browser. No image data is sent to any server during the texture generation process.</p><h4>3. User-Submitted Content</h4><p>You are solely responsible for the images you upload. You affirm, represent, and warrant that you own or have the necessary licenses, rights, consents, and permissions to use and authorize the Service to use your images. You agree not to submit any content that is unlawful, copyrighted without permission, or malicious.</p><h4>4. Generated Content</h4><p>You retain all intellectual property rights to the texture maps you generate using the Service. We claim no ownership over your original images or the resulting maps.</p><h4>5. Privacy and Data Storage</h4><p>AlbedoFlow respects your privacy. The tool is designed to work entirely in your browser:</p><ul><li><b>Image Processing:</b> Your images are processed locally on your computer and are never uploaded to our servers.</li><li><b>Language Preference:</b> To enhance your experience, we save your selected language (Portuguese or English) in your browser's <strong>localStorage</strong>. This is a small file on your computer that remembers your choice for your next visit. No personal data is stored.</li><li><b>Bug Reports and Suggestions:</b> If you choose to submit a bug report or suggestion using the contact form, the information you provide (your email, if you choose to share it, and your message) is sent to us via the third-party service <a href="https://formspree.io/privacy" target="_blank" rel="noopener noreferrer">Formspree</a>. This is the only instance where data is transmitted from the site. We use this information solely for the purpose of communicating with you about your feedback and improving the Service.</li></ul><p>The site is hosted on GitHub Pages. You can refer to GitHub's privacy statement for more information.</p><h4>6. Disclaimer of Warranties</h4><p>The Service is provided "as is". We make no warranty that the Service will meet your requirements, be uninterrupted, timely, secure, or error-free. Your use of the service is at your sole risk.</p><h4>7. Limitation of Liability</h4><p>In no event shall the developers of AlbedoFlow be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the service.</p><h4>8. Changes to Terms</h4><p>We reserve the right to modify these terms from time to time at our sole discretion. Therefore, you should review this page periodically.</p><p>Last updated: August 28, 2025</p>`,
        // ***** FIM DA CORREÇÃO *****
        termsClose: "Close",
        strengthTooltip: "Controls the depth and intensity of the map's details. Higher values create stronger reliefs.",
        invertYTooltip: "Inverts the green channel. Use this option if the lighting seems to come from the wrong direction. (OpenGL vs. DirectX)",
        invertValuesTooltip: "Inverts the black and white values of the texture. Useful for maps like Roughness, where white can mean rough or smooth depending on the engine.",
        sharpenTooltip: "Enhances the edges and fine details of the image, making it sharper.",
        smoothnessTooltip: "Applies a soft blur to reduce noise or unwanted details, resulting in a smoother surface.",
        levelsTooltip: "Adjusts the tonal range of the image, similar to the 'Levels' tool in image editing software.",
        blackPointTooltip: "Sets the darkest value of the image. All pixels darker than this point will become black.",
        whitePointTooltip: "Sets the lightest value of the image. All pixels lighter than this point will become white.",
        gammaTooltip: "Adjusts the mid-tones of the image without affecting the absolute black and white points.",
        proceduralNoiseTooltip: "Adds procedurally generated noise to the image to create fine surface details or variations.",
        scaleTooltip: "Controls the size and frequency of the noise pattern. Smaller values create larger, more spaced-out noise.",
        noiseStrengthTooltip: "Defines the visibility and intensity of the noise blended with the image.",
        blendModeTooltip: "Determines how the noise will be combined with the base image (e.g., add, multiply, overlay).",
        kernel: "Filter (Kernel)",
        kernelTooltip: "Defines the algorithm for calculating surface details. Scharr often provides more accurate results than Sobel.",
        sourceAdjustments: "Source Adjustments (Height)",
        sourceSmoothness: "Smooth Source",
        sourceSmoothnessTooltip: "Applies a blur to the height image *before* generating the normal map, to reduce noise and achieve smoother transitions.",
        normalBlackPointTooltip: "Adjusts the black point of the source height map, controlling which dark areas are considered 'flat'.",
        normalWhitePointTooltip: "Adjusts the white point of the source height map, controlling which light areas reach maximum 'height'.",
        normalGammaTooltip: "Adjusts the mid-tones of the source height map, influencing the relief curve without changing the extremes.",
        section1Title: "1. Global Settings",
        resolutionLabel: "Output Resolution",
        section2Title: "2. Base Image",
        selectImage: "Select Image",
        noFileSelected: "No file selected.",
        section3Title: "3. Texture Maps (Previews)",
        section4Title: "4. Adjustments & Tools",
        section5Title: "5. Export",
        format: "Format",
        quality: "Quality",
        baseFileNameLabel: "Base File Name",
        baseFileNamePlaceholder: "e.g. rock_texture",
        downloadMap: "Download Selected Map",
        downloadAll: "Download All (.zip)",
        generation: "Generation",
        strength: "Strength",
        invertY: "Invert Y-Axis (Green)",
        invertValues: "Invert Values",
        sharpen: "Sharpen",
        smoothness: "Smoothness",
        levels: "Levels",
        blackPoint: "Black Point",
        whitePoint: "White Point",
        gamma: "Gamma",
        proceduralNoise: "Procedural Noise",
        scale: "Scale",
        blendMode: "Blend Mode",
        viewerOptions: "Viewer Options",
        model3d: "3D Model",
        sphere: "Sphere",
        cube: "Cube",
        cylinder: "Cylinder",
        torus: "Torus",
        plane: "Plane",
        meshQuality: "Mesh Quality",
        viewMesh: "View Mesh",
        lighting: "Environment Lighting (HDR/EXR)",
        exposure: "Exposure",
        tiling: "Tiling",
        displacement: "Displacement",
        developedBy: "Developed by:",
        studioLights: "Enable Studio Lights",
        curvature: "Curvature",
        curvatureDetails: "Detail Level",
        curvatureDetailsTooltip: "Controls the sampling distance for calculating curvature. Larger values capture broader details.",
        curvatureMode: "Display Mode",
        curvatureModeTooltip: "Filters the map to show edges (convex), crevices (concave), or both.",
        modeBoth: "Both",
        modeEdges: "Edges Only",
        modeCrevices: "Crevices Only",
        heightContrast: "Intensity (Contrast)",
        heightContrastTooltip: "Increases or decreases the difference between the high and low areas of the relief.",
        colorAdjustments: "Color Adjustments",
        brightness: "Brightness",
        brightnessTooltip: "Adjusts the overall brightness of the image.",
        contrast: "Contrast",
        contrastTooltip: "Adjusts the difference between light and dark areas.",
        saturation: "Saturation",
        saturationTooltip: "Adjusts the intensity of the colors.",
        hue: "Hue",
        hueTooltip: "Shifts the overall hue of the image's colors.",
        generateMapsModalTitle: "Select Maps to Generate",
        generateMapsModalDesc: "Choose which texture maps you want to create from your base image.",
        cancel: "Cancel",
        generateMaps: "Generate Maps",
        toggleVisibilityTooltip: "Enable or disable this map in the 3D viewer",
        resetGroupTooltip: "Reset this group of controls",
    }
};

// ===================================================================================
// VARIÁVEIS GLOBAIS DE ESTADO
// ===================================================================================

let currentLang = 'pt';
let originalImage = null;
let activeMap = 'diffuse';
let textureSize = 2048;
let generatedMaps = new Set();
let enabledMaps = new Set();
let generationModal;

let scene, camera, renderer, controls, mesh;
let pbrMaterial = new THREE.MeshStandardMaterial({ metalness: 0, roughness: 0.5 });
let currentModelName = 'sphere';
let polyCount = 128;
let currentTiling = 1;
let currentDisplacement = 0.05;
let currentExposure = 1.0;

const loader = document.getElementById('loader');
const canvases = {};
const previewContexts = {};
const workerCanvases = {};
const simplex = new SimplexNoise();

const DEFAULT_SETTINGS = {
    diffuse: { brightness: 1.0, contrast: 1.0, saturation: 1.0, hue: 0 },
    height: { contrast: 1.0, invert: false, sharpen: 0, smoothness: 0, levelsInBlack: 0, levelsInWhite: 255, levelsGamma: 1.0 },
    normal: { strength: 2.0, invertY: false, kernel: 'sobel', sourceSmoothness: 0, sourceLevelsInBlack: 0, sourceLevelsInWhite: 255, sourceLevelsGamma: 1.0 },
    curvature: { details: 1, mode: 'both', invert: false, sharpen: 0, smoothness: 0, levelsInBlack: 0, levelsInWhite: 255, levelsGamma: 1.0 },
    ao: { invert: false, sharpen: 0, smoothness: 0, levelsInBlack: 0, levelsInWhite: 255, levelsGamma: 1.0, noiseScale: 50, noiseStrength: 0, noiseBlendMode: 'overlay' },
    roughness: { invert: false, sharpen: 0, smoothness: 0, levelsInBlack: 0, levelsInWhite: 255, levelsGamma: 1.0, noiseScale: 50, noiseStrength: 0, noiseBlendMode: 'overlay' },
    metallic: { invert: false, sharpen: 0, smoothness: 0, levelsInBlack: 0, levelsInWhite: 255, levelsGamma: 1.0, noiseScale: 50, noiseStrength: 0, noiseBlendMode: 'overlay' }
};

let settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

const GROUP_KEYS = {
    color: ['brightness', 'contrast', 'saturation', 'hue'],
    generation: ['invert', 'contrast', 'sharpen', 'smoothness', 'strength', 'kernel', 'invertY', 'details', 'mode'],
    levels: ['levelsInBlack', 'levelsInWhite', 'levelsGamma'],
    source: ['sourceSmoothness', 'sourceLevelsInBlack', 'sourceLevelsInWhite', 'sourceLevelsGamma'],
    general: ['invert', 'sharpen', 'smoothness'],
    noise: ['noiseScale', 'noiseStrength', 'noiseBlendMode']
};

// ===================================================================================
// LÓGICA DO VISUALIZADOR 3D
// ===================================================================================

function init3DViewer() {
    const viewer = document.getElementById("viewer3d");
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x282c34);

    camera = new THREE.PerspectiveCamera(55, viewer.clientWidth / viewer.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 3);

    renderer = new THREE.WebGLRenderer({ canvas: viewer, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = currentExposure;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);

    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x444444, 0.8);
    scene.add(hemisphereLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e1, 1.5);
    keyLight.position.set(-5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xddeeff, 0.6);
    fillLight.position.set(5, 3, 2);
    scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
    rimLight.position.set(0, 2, -5);
    scene.add(rimLight);

    mesh = new THREE.Mesh(getGeometry(currentModelName, polyCount), pbrMaterial);
    mesh.castShadow = true;
    scene.add(mesh);

    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.y = -1.2;
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    resizeRendererToDisplaySize();
    controls.update();
    renderer.render(scene, camera);
}

function resizeRendererToDisplaySize() {
    if (!renderer) return;
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
}

// ===================================================================================
// LÓGICA DE PROCESSAMENTO DE MAPAS
// ===================================================================================
function processMap(mapName){if(!originalImage)return;const canvas=workerCanvases[mapName];if(!canvas)return;const ctx=canvas.getContext('2d',{willReadFrequently:true});const s=settings[mapName]||{};ctx.drawImage(originalImage,0,0,textureSize,textureSize);if(mapName==='diffuse'){applyColorAdjustments(ctx,s)}else if(mapName==='orm'){if(!workerCanvases.ao||!workerCanvases.roughness||!workerCanvases.metallic)return;const aoData=workerCanvases.ao.getContext('2d').getImageData(0,0,textureSize,textureSize).data;const roughData=workerCanvases.roughness.getContext('2d').getImageData(0,0,textureSize,textureSize).data;const metalData=workerCanvases.metallic.getContext('2d').getImageData(0,0,textureSize,textureSize).data;const ormImageData=ctx.createImageData(textureSize,textureSize);const d=ormImageData.data;for(let i=0;i<d.length;i+=4){d[i]=aoData[i];d[i+1]=roughData[i];d[i+2]=metalData[i];d[i+3]=255}ctx.putImageData(ormImageData,0,0)}else if(mapName==='normal'){if(!workerCanvases.height)return;generateNormalMap(ctx)}else if(mapName==='ao'){if(!workerCanvases.height)return;generateAOMap(ctx);applyGrayscaleAdjustments(ctx,s)}else if(mapName==='curvature'){if(!workerCanvases.normal)return;generateCurvatureMap(ctx);applyGrayscaleAdjustments(ctx,s,true)}else{let imageData=ctx.getImageData(0,0,textureSize,textureSize);let data=imageData.data;for(let i=0;i<data.length;i+=4){let g=data[i]*0.299+data[i+1]*0.587+data[i+2]*0.114;data[i]=data[i+1]=data[i+2]=g}ctx.putImageData(imageData,0,0);if(mapName==='height'){if(s.contrast!==1){let imgData=ctx.getImageData(0,0,textureSize,textureSize);let d=imgData.data;for(let i=0;i<d.length;i+=4){let v=127.5+(d[i]-127.5)*s.contrast;d[i]=d[i+1]=d[i+2]=v}ctx.putImageData(imgData,0,0)}applyGrayscaleAdjustments(ctx,s,true)}else{applyGrayscaleAdjustments(ctx,s)}}}
function generateNormalMap(ctx){const sn=settings.normal;const sourceCtx=workerCanvases.height.getContext('2d');const sourceImageData=sourceCtx.getImageData(0,0,textureSize,textureSize);const tempCanvas=document.createElement('canvas');tempCanvas.width=tempCanvas.height=textureSize;const tempCtx=tempCanvas.getContext('2d');tempCtx.putImageData(sourceImageData,0,0);let processedSourceData=tempCtx.getImageData(0,0,textureSize,textureSize);let data=processedSourceData.data;const b=sn.sourceLevelsInBlack,w=sn.sourceLevelsInWhite,g=1/sn.sourceLevelsGamma,r=w-b;if(r>0){for(let i=0;i<data.length;i+=4){let v=Math.pow(Math.max(0,Math.min(1,(data[i]-b)/r)),g)*255;data[i]=data[i+1]=data[i+2]=v}}if(sn.sourceSmoothness>0){applyBoxBlur(data,textureSize,sn.sourceSmoothness)}const normalImageData=ctx.createImageData(textureSize,textureSize);const normalData=normalImageData.data;const kx=sn.kernel==='scharr'?[[-3,0,3],[-10,0,10],[-3,0,3]]:[[-1,0,1],[-2,0,2],[-1,0,1]];const ky=sn.kernel==='scharr'?[[-3,-10,-3],[0,0,0],[3,10,3]]:[[-1,-2,-1],[0,0,0],[1,2,1]];for(let y=0;y<textureSize;y++){for(let x=0;x<textureSize;x++){let dx=0,dy=0;for(let j=-1;j<=1;j++){for(let i=-1;i<=1;i++){const pixelX=Math.min(textureSize-1,Math.max(0,x+i));const pixelY=Math.min(textureSize-1,Math.max(0,y+j));const pixelVal=data[(pixelY*textureSize+pixelX)*4];dx+=kx[j+1][i+1]*pixelVal;dy+=ky[j+1][i+1]*pixelVal}}const vec=(new THREE.Vector3(dx,dy,255/sn.strength)).normalize();const idx=(y*textureSize+x)*4;normalData[idx]=(vec.x+1)*127.5;normalData[idx+1]=(sn.invertY?1-vec.y:vec.y+1)*127.5;normalData[idx+2]=(vec.z+1)*127.5;normalData[idx+3]=255}}ctx.putImageData(normalImageData,0,0)}
function generateAOMap(ctx){const heightData=workerCanvases.height.getContext('2d').getImageData(0,0,textureSize,textureSize).data;const aoImageData=ctx.createImageData(textureSize,textureSize);const aoData=aoImageData.data;const directions=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];const maxDist=32;const strength=2.5;for(let y=0;y<textureSize;y++){for(let x=0;x<textureSize;x++){const centerIdx=(y*textureSize+x)*4;const centerHeight=heightData[centerIdx];let occlusion=0;for(const[dx,dy]of directions){let maxAngle=0;for(let step=1;step<=maxDist;step++){const nx=x+dx*step,ny=y+dy*step;if(nx>=0&&nx<textureSize&&ny>=0&&ny<textureSize){const neighborHeight=heightData[(ny*textureSize+nx)*4];const heightDiff=neighborHeight-centerHeight;if(heightDiff>0){const angle=Math.atan(heightDiff/step);if(angle>maxAngle)maxAngle=angle}}}occlusion+=maxAngle}let aoValue=1-(occlusion/(directions.length*Math.PI/2))*strength;aoValue=Math.max(0,Math.min(1,aoValue));const finalVal=255*aoValue;aoData[centerIdx]=aoData[centerIdx+1]=aoData[centerIdx+2]=finalVal;aoData[centerIdx+3]=255}}ctx.putImageData(aoImageData,0,0)}
function generateCurvatureMap(ctx){const s=settings.curvature;const details=Math.max(1,Math.floor(s.details));const normalData=workerCanvases.normal.getContext('2d').getImageData(0,0,textureSize,textureSize).data;const curvatureImageData=ctx.createImageData(textureSize,textureSize);const curvatureData=curvatureImageData.data;for(let y=0;y<textureSize;y++){for(let x=0;x<textureSize;x++){const x_plus=Math.min(x+details,textureSize-1);const y_plus=Math.min(y+details,textureSize-1);const x_minus=Math.max(x-details,0);const y_minus=Math.max(y-details,0);const n_right_x=(normalData[(y*textureSize+x_plus)*4]/127.5)-1;const n_left_x=(normalData[(y*textureSize+x_minus)*4]/127.5)-1;const n_down_y=(normalData[(y_plus*textureSize+x)*4+1]/127.5)-1;const n_up_y=(normalData[(y_minus*textureSize+x)*4+1]/127.5)-1;const ddx=(n_right_x-n_left_x)/(2*details);const ddy=(n_down_y-n_up_y)/(2*details);const strength=4;let rawCurvature=(ddx+ddy)*strength;let finalVal=0;switch(s.mode){case'edges':finalVal=Math.max(0,rawCurvature);break;case'crevices':finalVal=Math.max(0,-rawCurvature);break;case'both':default:finalVal=0.5+rawCurvature*0.5;break}finalVal=Math.max(0,Math.min(1,finalVal))*255;const idx=(y*textureSize+x)*4;curvatureData[idx]=curvatureData[idx+1]=curvatureData[idx+2]=finalVal;curvatureData[idx+3]=255}}ctx.putImageData(curvatureImageData,0,0)}
function applyColorAdjustments(ctx,s){let imageData=ctx.getImageData(0,0,textureSize,textureSize);let data=imageData.data;const{brightness,contrast,saturation,hue}=s;for(let i=0;i<data.length;i+=4){let r=data[i],g=data[i+1],b=data[i+2];r=127.5+(r-127.5)*contrast;g=127.5+(g-127.5)*contrast;b=127.5+(b-127.5)*contrast;r*=brightness;g*=brightness;b*=brightness;if(saturation!==1||hue!==0){let hsl=rgbToHsl(r,g,b);hsl[0]=(hsl[0]+hue/360+1)%1;hsl[1]*=saturation;let rgb=hslToRgb(hsl[0],hsl[1],hsl[2]);r=rgb[0];g=rgb[1];b=rgb[2]}data[i]=Math.max(0,Math.min(255,r));data[i+1]=Math.max(0,Math.min(255,g));data[i+2]=Math.max(0,Math.min(255,b))}ctx.putImageData(imageData,0,0)}
function applyGrayscaleAdjustments(ctx,s,skipNoise=false){let imageData=ctx.getImageData(0,0,textureSize,textureSize);let data=imageData.data;const b=s.levelsInBlack,w=s.levelsInWhite,g=1/s.levelsGamma,r=w-b;if(r>0){for(let i=0;i<data.length;i+=4){let v=Math.pow(Math.max(0,Math.min(1,(data[i]-b)/r)),g)*255;data[i]=data[i+1]=data[i+2]=v}}if(s.invert){for(let i=0;i<data.length;i+=4){data[i]=255-data[i];data[i+1]=255-data[i+1];data[i+2]=255-data[i+2]}}if(s.sharpen>0){const k=[0,-s.sharpen,0,-s.sharpen,1+4*s.sharpen,-s.sharpen,0,-s.sharpen,0];applyConvolution(data,k,textureSize)}if(s.smoothness>0){applyBoxBlur(data,textureSize,s.smoothness)}if(!skipNoise&&s.hasOwnProperty('noiseStrength')&&s.noiseStrength>0){const noiseData=generateNoise(s.noiseScale);for(let i=0;i<data.length;i+=4){const base=data[i]/255;const blend=noiseData[i/4]*s.noiseStrength;let res=Math.max(0,Math.min(1,blendValues(base,blend,s.noiseBlendMode)))*255;data[i]=data[i+1]=data[i+2]=res}}ctx.putImageData(imageData,0,0)}
function applyConvolution(data,kernel,size){const src=new Uint8ClampedArray(data);const side=Math.round(Math.sqrt(kernel.length));const halfSide=Math.floor(side/2);for(let y=0;y<size;y++){for(let x=0;x<size;x++){let r=0;for(let cy=0;cy<side;cy++){for(let cx=0;cx<side;cx++){const scy=y+cy-halfSide;const scx=x+cx-halfSide;if(scy>=0&&scy<size&&scx>=0&&scx<size){const srcOff=(scy*size+scx)*4;const wt=kernel[cy*side+cx];r+=src[srcOff]*wt}}}const dstOff=(y*size+x)*4;data[dstOff]=data[dstOff+1]=data[dstOff+2]=r}}}
function applyBoxBlur(data,width,radius){const src=new Uint8ClampedArray(data);for(let i=0;i<data.length;i+=4){let r=0,g=0,b=0,count=0;for(let y=-radius;y<=radius;y++){for(let x=-radius;x<=radius;x++){const px=Math.floor(i/4)%width+x,py=Math.floor(i/4/width)+y;if(px>=0&&px<width&&py>=0&&py<width){const index=(py*width+px)*4;r+=src[index];g+=src[index+1];b+=src[index+2];count++}}}data[i]=r/count;data[i+1]=g/count;data[i+2]=b/count}}
function generateNoise(scale){const noiseData=new Float32Array(textureSize*textureSize);for(let y=0;y<textureSize;y++){for(let x=0;x<textureSize;x++){noiseData[y*textureSize+x]=(simplex.noise2D(x/scale,y/scale)+1)/2}}return noiseData}
function blendValues(base,blend,mode){switch(mode){case"add":return base+blend;case"subtract":return base-blend;case"multiply":return base*blend;case"overlay":default:return base<.5?2*base*blend:1-2*(1-base)*(1-blend)}}
function rgbToHsl(r,g,b){r/=255,g/=255,b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h,s,l=(max+min)/2;if(max===min){h=s=0}else{const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break}h/=6}return[h,s,l]}
function hslToRgb(h,s,l){let r,g,b;if(s===0){r=g=b=l}else{const hue2rgb=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p};const q=l<0.5?l*(1+s):l+s-l*s;const p=2*l-q;r=hue2rgb(p,q,h+1/3);g=hue2rgb(p,q,h);b=hue2rgb(p,q,h-1/3)}return[r*255,g*255,b*255]}
function initWorkerCanvases(size){ALL_MAP_TYPES.forEach(mapName=>{workerCanvases[mapName]=document.createElement('canvas');workerCanvases[mapName].width=workerCanvases[mapName].height=size})}
function getGeometry(modelName,segments){const segs=Math.max(4,segments);const radialSegs=Math.max(8,Math.floor(segs/2));const tubularSegs=Math.max(3,Math.floor(segs/4));switch(modelName){case"cube":return new THREE.BoxGeometry(1.2,1.2,1.2,segs,segs,segs);case"cylinder":return new THREE.CylinderGeometry(0.6,0.6,1.5,segs,tubularSegs);case"torus":return new THREE.TorusGeometry(0.8,0.3,radialSegs,segs);case"plane":return new THREE.PlaneGeometry(1.5,1.5,segs,segs);case"sphere":default:return new THREE.SphereGeometry(0.9,segs,radialSegs)}}
function applyViewerProperties(){renderer.toneMappingExposure=currentExposure;pbrMaterial.displacementScale=currentDisplacement;for(const mapKey in pbrMaterial){if(pbrMaterial[mapKey]?.isTexture){const texture=pbrMaterial[mapKey];texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(currentTiling,currentTiling);texture.needsUpdate=true}}}
function updateValueLabels(){document.querySelectorAll(".slider-group input[type=range]").forEach(input=>{const valueEl=document.getElementById(input.id+"Value");if(valueEl){valueEl.textContent=parseFloat(input.value).toFixed(input.step.includes(".")?2:0)}})}
function getExportBaseName(){let baseName=document.getElementById('export-basename').value.trim();if(!baseName){const originalFileName=document.getElementById('fileName').textContent;baseName=(originalFileName&&!['Nenhum arquivo.','No file selected.'].includes(originalFileName))?originalFileName.split('.').slice(0,-1).join('.'):'texture'}return baseName.replace(/[^a-z0-9_.-]/gi,'_')}
function showLoader(){loader.classList.add('visible')}
function hideLoader(){loader.classList.remove('visible')}

// ===================================================================================
// FUNÇÕES DE ATUALIZAÇÃO DE UI E 3D
// ===================================================================================

function processSelectedMaps(mapsToGenerate) {
    if (!originalImage) return;
    showLoader();

    generatedMaps = new Set(mapsToGenerate);
    enabledMaps = new Set(mapsToGenerate);

    if (!workerCanvases.diffuse || workerCanvases.diffuse.width !== textureSize) {
        initWorkerCanvases(textureSize);
    }
    
    const processingOrder = ["diffuse", "height", "roughness", "metallic", "normal", "curvature", "ao", "orm"];
    const loaderTextElement = document.querySelector('#loader span');
    let processedCount = 0;
    const totalToProcess = generatedMaps.size;

    function processSequentially(index) {
        if (index >= processingOrder.length) {
            updateUIBasedOnGeneratedMaps();
            update3DMaterial();
            updatePreviews();
            hideLoader();
            return;
        }

        const mapName = processingOrder[index];
        if (generatedMaps.has(mapName)) {
            processedCount++;
            const capitalMapName = mapName.charAt(0).toUpperCase() + mapName.slice(1);
            loaderTextElement.textContent = `${translations[currentLang].loaderProcessing} (${processedCount}/${totalToProcess}) - ${capitalMapName}`;
            processMap(mapName);
        }
        
        setTimeout(() => processSequentially(index + 1), 0);
    }

    setTimeout(() => processSequentially(0), 10);
}

function update3DMaterial() {
    const textureMap = { map: 'diffuse', normalMap: 'normal', aoMap: 'ao', roughnessMap: 'roughness', metalnessMap: 'metallic', displacementMap: 'height' };

    for (const [materialProp, mapName] of Object.entries(textureMap)) {
        if (pbrMaterial[materialProp]) {
            pbrMaterial[materialProp].dispose();
            pbrMaterial[materialProp] = null;
        }
        if (enabledMaps.has(mapName) && workerCanvases[mapName]) {
            const canvas = workerCanvases[mapName];
            const texture = new THREE.CanvasTexture(canvas);
            if (materialProp === 'map') texture.colorSpace = THREE.SRGBColorSpace;
            texture.needsUpdate = true;
            pbrMaterial[materialProp] = texture;
        }
    }
    
    pbrMaterial.metalness = enabledMaps.has('metallic') ? 1.0 : 0.0;
    pbrMaterial.roughness = enabledMaps.has('roughness') ? 1.0 : 0.5;
    pbrMaterial.needsUpdate = true;
    applyViewerProperties();
}

function updatePreviews() {
    for (const key in previewContexts) {
        if (generatedMaps.has(key) && workerCanvases[key]) {
            previewContexts[key].clearRect(0, 0, 256, 256);
            previewContexts[key].drawImage(workerCanvases[key], 0, 0, 256, 256);
        }
    }
}

function updateUIBasedOnGeneratedMaps() {
    document.querySelectorAll('.texture-preview').forEach(preview => {
        const mapName = preview.id.replace('preview-', '');
        const wasGenerated = generatedMaps.has(mapName);
        preview.style.display = wasGenerated ? 'block' : 'none';
        if (wasGenerated) {
            toggleMapVisualState(mapName, enabledMaps.has(mapName));
        }
    });

    const firstGenerated = [...generatedMaps][0] || 'diffuse';
    document.querySelector('.texture-preview.active')?.classList.remove('active');
    const firstPreview = document.getElementById(`preview-${firstGenerated}`);
    if (firstPreview) {
        firstPreview.classList.add('active');
        activeMap = firstGenerated;
    }
    
    showToolsForMap(activeMap);
}

function toggleMapVisualState(mapName, isEnabled) {
    const previewEl = document.getElementById(`preview-${mapName}`);
    if (!previewEl) return;

    const button = previewEl.querySelector('.toggle-visibility');
    const icon = button.querySelector('i');
    const isGrayscale = ['ao', 'roughness', 'metallic'].includes(mapName);
    const controlsId = isGrayscale ? 'controls-grayscale' : `controls-${mapName}`;
    const fieldset = document.querySelector(`#${controlsId} fieldset`);

    if (isEnabled) {
        previewEl.classList.remove('disabled');
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        previewEl.classList.add('disabled');
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
    
    if (mapName === activeMap && fieldset) {
        fieldset.disabled = !isEnabled;
    }
}

function showToolsForMap(mapName) {
    document.querySelectorAll(".toolset").forEach(ts => ts.style.display = "none");
    const s = settings[mapName];
    if (!s || !generatedMaps.has(mapName)) return;

    let toolsetId;
    switch (mapName) {
        case 'diffuse': toolsetId = 'controls-diffuse'; break;
        case 'height': toolsetId = 'controls-height'; break;
        case 'normal': toolsetId = 'controls-normal'; break;
        case 'curvature': toolsetId = 'controls-curvature'; break;
        case 'ao': case 'roughness': case 'metallic': toolsetId = 'controls-grayscale'; break;
    }

    if (toolsetId) {
        const toolset = document.getElementById(toolsetId);
        toolset.style.display = "block";
        const fieldset = toolset.querySelector('fieldset');
        if(fieldset) fieldset.disabled = !enabledMaps.has(mapName);

        for (const key in s) {
            const inputId = (toolsetId === 'controls-grayscale') ? key : `${mapName}${key.charAt(0).toUpperCase() + key.slice(1)}`;
            const input = toolset.querySelector(`#${inputId}`);
            if (input) {
                if (input.type === 'checkbox') input.checked = s[key];
                else input.value = s[key];
            }
        }
    }
    updateValueLabels();
}

function setLanguage(lang) {
    currentLang = lang;
    const langDict = translations[lang] || translations.pt;

    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');
        if (!langDict[key]) return;
        if (key === 'termsModalBody') {
            el.innerHTML = langDict[key];
            return;
        }
        const textNode = Array.from(el.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0);
        if (textNode) {
            textNode.textContent = langDict[key];
        } else if (el.tagName !== 'BUTTON' && el.children.length === 0) {
            el.textContent = langDict[key];
        }
    });

    document.querySelectorAll('[data-lang-title-key]').forEach(el => {
        const key = el.getAttribute('data-lang-title-key');
        if (langDict[key]) el.setAttribute('title', langDict[key]);
    });
    
    document.querySelectorAll('[data-lang-placeholder-key]').forEach(el => {
        const key = el.getAttribute('data-lang-placeholder-key');
        if (langDict[key]) el.setAttribute('placeholder', langDict[key]);
    });

    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    document.getElementById('check-pt').innerHTML = lang === 'pt' ? '<i class="fa-solid fa-check" aria-hidden="true"></i>' : '';
    document.getElementById('check-en').innerHTML = lang === 'en' ? '<i class="fa-solid fa-check" aria-hidden="true"></i>' : '';
    localStorage.setItem('language', lang);
}

async function downloadAllAsZip() {
    const btn = document.getElementById("exportAllBtn");
    btn.disabled = true;
    const baseName = getExportBaseName();
    const zip = new JSZip();
    const mapsToZip = [...enabledMaps];
    const promises = mapsToZip.map(name => new Promise(resolve => {
        if (workerCanvases[name]) {
            workerCanvases[name].toBlob(blob => {
                if (blob) zip.file(`${baseName}_${name}.png`, blob);
                resolve();
            }, "image/png");
        } else {
            resolve();
        }
    }));
    await Promise.all(promises);
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `${baseName}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
    btn.disabled = false;
}

// ===================================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ===================================================================================

document.addEventListener('DOMContentLoaded', () => {
    try {
        ALL_MAP_TYPES.forEach(map => {
            const canvas = document.getElementById(`canvas-${map}`);
            if (canvas) {
                canvases[map] = canvas;
                canvases[map].width = canvases[map].height = 256;
                previewContexts[map] = canvas.getContext('2d', { willReadFrequently: true });
            }
        });
        generationModal = new bootstrap.Modal(document.getElementById('generateMapsModal'));
        initApp();
    } catch (error) {
        console.error("Erro fatal durante a inicialização:", error);
        document.body.innerHTML = '<h1>Ocorreu um erro ao carregar a aplicação. Verifique o console (F12) para mais detalhes.</h1>';
    }
});


function initApp() {
    const processAndUpdate = () => {
        showLoader();
        setTimeout(() => {
            const mapsToUpdate = new Set([activeMap]);
            if (activeMap === 'diffuse') { ['height', 'normal', 'ao', 'curvature', 'roughness', 'metallic', 'orm'].forEach(m => {if(generatedMaps.has(m)) mapsToUpdate.add(m)}); }
            if (activeMap === 'height') { ['normal', 'ao', 'curvature'].forEach(m => {if(generatedMaps.has(m)) mapsToUpdate.add(m)}); }
            if (activeMap === 'normal') { if(generatedMaps.has('curvature')) mapsToUpdate.add('curvature'); }
            if (['ao', 'roughness', 'metallic'].includes(activeMap)) { if(generatedMaps.has('orm')) mapsToUpdate.add('orm'); }
            const processOrder = ["diffuse", "height", "roughness", "metallic", "normal", "curvature", "ao", "orm"];
            processOrder.forEach(map => { if (mapsToUpdate.has(map)) processMap(map); });
            if (enabledMaps.has(activeMap)) update3DMaterial();
            updatePreviews();
            hideLoader();
        }, 10);
    };

    document.getElementById('year').textContent = new Date().getFullYear();

    document.getElementById('imageLoader').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        document.getElementById("fileName").textContent = file.name;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                originalImage = img;
                generationModal.show();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    });

    document.getElementById('confirmGenerationBtn').addEventListener('click', () => {
        const selectedMaps = new Set();
        document.querySelectorAll('#maps-selection-list input:checked').forEach(input => {
            selectedMaps.add(input.value);
        });

        if (selectedMaps.has('normal') || selectedMaps.has('ao')) selectedMaps.add('height');
        if (selectedMaps.has('curvature')) { selectedMaps.add('height'); selectedMaps.add('normal'); }
        if (selectedMaps.has('orm')) { selectedMaps.add('ao'); selectedMaps.add('roughness'); selectedMaps.add('metallic'); }

        if (selectedMaps.size > 0) {
            ['maps-section', 'controls-section', 'export-section'].forEach(id => document.getElementById(id).style.display = 'block');
            ['exportBtn', 'exportAllBtn'].forEach(id => document.getElementById(id).disabled = false);
            settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
            processSelectedMaps([...selectedMaps]);
        }
        generationModal.hide();
    });

    document.getElementById('resolution-select').addEventListener('change', (e) => {
        textureSize = parseInt(e.target.value);
        if (originalImage && generatedMaps.size > 0) {
            processSelectedMaps([...generatedMaps]);
        }
    });

    document.querySelectorAll('#tool-container input, #tool-container select').forEach(input => {
        if (input.type === 'range') {
            input.addEventListener('input', updateValueLabels);
        }
        input.addEventListener('change', () => processAndUpdate());
    });
    
    document.querySelectorAll('.btn-reset-group').forEach(button => {
        button.addEventListener('click', (e) => {
            const toolsetId = e.currentTarget.closest('.toolset')?.id;
            const groupName = e.currentTarget.dataset.resetGroup;
            if (!toolsetId || !groupName) return;
            let settingKey = toolsetId.replace('controls-', '');
            let targetMap = (settingKey === 'grayscale') ? activeMap : settingKey;
            const keysToReset = GROUP_KEYS[groupName];
            if (keysToReset && settings[targetMap] && DEFAULT_SETTINGS[targetMap]) {
                keysToReset.forEach(key => {
                    if (DEFAULT_SETTINGS[targetMap].hasOwnProperty(key)) {
                        settings[targetMap][key] = DEFAULT_SETTINGS[targetMap][key];
                    }
                });
                showToolsForMap(targetMap);
                processAndUpdate();
            }
        });
    });

    document.querySelectorAll('.texture-preview').forEach(preview => {
        const mapName = preview.id.replace("preview-", "");
        
        preview.addEventListener("click", () => {
            if (!generatedMaps.has(mapName)) return;
            document.querySelector(".texture-preview.active")?.classList.remove("active");
            preview.classList.add("active");
            activeMap = mapName;
            showToolsForMap(activeMap);
        });

        const toggleBtn = preview.querySelector('.toggle-visibility');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (enabledMaps.has(mapName)) {
                    enabledMaps.delete(mapName);
                } else {
                    enabledMaps.add(mapName);
                }
                toggleMapVisualState(mapName, enabledMaps.has(mapName));
                update3DMaterial();
            });
        }
    });

    document.querySelector('.viewer-controls-header').addEventListener('click', e => e.currentTarget.parentElement.classList.toggle('collapsed'));
    document.getElementById('model-select').addEventListener('change', e => { currentModelName = e.target.value; if (mesh) { mesh.geometry.dispose(); mesh.geometry = getGeometry(currentModelName, polyCount); } });
    document.getElementById('polyCountSlider').addEventListener('input', e => { polyCount = parseInt(e.target.value); document.getElementById('polyCountSliderValue').textContent = polyCount; if (mesh) { mesh.geometry.dispose(); mesh.geometry = getGeometry(currentModelName, polyCount); } });
    document.getElementById('wireframeToggle').addEventListener('change', e => { pbrMaterial.wireframe = e.target.checked; });
    document.getElementById('exposure').addEventListener('input', e => { currentExposure = parseFloat(e.target.value); renderer.toneMappingExposure = currentExposure; updateValueLabels(); });
    document.getElementById('tiling').addEventListener('input', e => { currentTiling = parseInt(e.target.value); applyViewerProperties(); updateValueLabels(); });
    document.getElementById('displacement').addEventListener('input', e => { currentDisplacement = parseFloat(e.target.value); applyViewerProperties(); updateValueLabels(); });
    document.getElementById('export-format').addEventListener('change', (e) => { document.getElementById('jpeg-quality-group').style.display = e.target.value === 'jpeg' ? 'block' : 'none'; });
    document.getElementById('exportBtn').addEventListener('click', () => { const format = document.getElementById('export-format').value; const quality = parseInt(document.getElementById('jpeg-quality').value) / 100; const canvas = workerCanvases[activeMap]; if (!canvas || !enabledMaps.has(activeMap)) return; const baseName = getExportBaseName(); const link = document.createElement("a"); link.download = `${baseName}_${activeMap}.${format}`; link.href = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? quality : undefined); link.click(); URL.revokeObjectURL(link.href); });
    document.getElementById('exportAllBtn').addEventListener('click', downloadAllAsZip);
    document.getElementById('lang-pt').addEventListener('click', (e) => { e.preventDefault(); setLanguage('pt'); });
    document.getElementById('lang-en').addEventListener('click', (e) => { e.preventDefault(); setLanguage('en'); });
    document.getElementById('fullscreenBtn').addEventListener('click', () => { if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); document.getElementById('icon-fullscreen').style.display = 'none'; document.getElementById('icon-exit-fullscreen').style.display = 'inline-block'; } else if (document.exitFullscreen) { document.exitFullscreen(); document.getElementById('icon-fullscreen').style.display = 'inline-block'; document.getElementById('icon-exit-fullscreen').style.display = 'none'; } });
    document.getElementById('report-form').addEventListener('submit', async (e) => { e.preventDefault(); const form = e.target; const statusDiv = document.getElementById('report-form-status'); const submitBtn = document.getElementById('report-submit-btn'); const spinner = submitBtn.querySelector('.spinner-border'); spinner.style.display = 'inline-block'; submitBtn.disabled = true; statusDiv.innerHTML = ''; try { const response = await fetch(FORMSPREE_ENDPOINT, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } }); if (response.ok) { statusDiv.innerHTML = `<div class="alert alert-success" role="alert">${translations[currentLang].reportSuccess}</div>`; form.reset(); } else { const data = await response.json(); const message = data.errors?.map(err => err.message).join(", ") || translations[currentLang].reportError; statusDiv.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`; } } catch (error) { statusDiv.innerHTML = `<div class="alert alert-danger" role="alert">${translations[currentLang].reportError}</div>`; } finally { spinner.style.display = 'none'; submitBtn.disabled = false; } });

    // --- INICIALIZAÇÃO FINAL ---
    init3DViewer();
    initWorkerCanvases(textureSize);
    const savedLang = localStorage.getItem('language') || (navigator.language.startsWith('en') ? 'en' : 'pt');
    setLanguage(savedLang);
    updateValueLabels();
    document.getElementById('polyCountSliderValue').textContent = polyCount;
    document.getElementById('exposure').value = currentExposure;
    
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}