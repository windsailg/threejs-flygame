import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js'
import { FlyControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/FlyControls.js'
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js'
// import { FlyControls } from 'three/addons/controls/FlyControls.js'
import { GUI } from './lil-gui.module.min.js'
// import { Sky } from 'https://cdn.jsdelivr.net/npm/three-skybox@0.0.2/index.min.js'

const CONSTANTS = {
  CAMERA_FOV: 50,
  CCAMERA_NEAR_DISTANCE: 1,
  CCAMERA_FAR_DISTANCE: 2000,
  CONTROLS_MIN_DISTANCE: 20,
  CONTROLS_MAX_DISTANCE: 500,
  SKY_SPHARE_SIZE: 500,
}

const textureLoader = new THREE.TextureLoader()
const backgroundTexture = textureLoader.load('textrue/00.png')
const texture_moon = {
  // map: textureLoader.load('textrue/moon/moon_high.jpg'),
  // normalMap: textureLoader.load('textrue/moon/moon_NORM.jpg'),
  // displacementMap: textureLoader.load('textrue/moon/moon_DISP.jpg'),
}
const texture_lapis = {
  occMap: textureLoader.load('textrue/lapis-lazuli/lapis_OCC.jpg'),
  colorMap: textureLoader.load('textrue/lapis-lazuli/lapis_COLOR.jpg'),
  normalMap: textureLoader.load('textrue/lapis-lazuli/lapis_NORM.jpg'),
  displacementMap: textureLoader.load('textrue/lapis-lazuli/lapis_DISP.png'),
  roughnessMap: textureLoader.load('textrue/lapis-lazuli/lapis_ROUGH.jpg'),
}

const scalar = (index) => {
  const isMinus = Math.random() < 0.5
  const value = Math.floor(Math.random() * (80 * index) + 8)
  return isMinus ? -value : value
}
const sizeScalar = (scalar) => Math.floor(Math.random() * scalar) + 1 // ~ scalar(max)

// Create scene
let scene, camera, renderer
const createScene = () => {
  scene = new THREE.Scene()
  scene.name = 'scene'
  // scene.backgroundBlurriness = 0.8
}

const createCamera = () => {
  // 設置鏡頭，視角為透視模型(角度，長寬比，最近距離，最遠距離)
  camera = new THREE.PerspectiveCamera(
    CONSTANTS.CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    CONSTANTS.CCAMERA_NEAR_DISTANCE,
    CONSTANTS.CCAMERA_FAR_DISTANCE,
  )
  camera.position.z = 50
}

const createRenderer = () => {
  renderer = new THREE.WebGLRenderer() //建立渲染器
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.toneMappingExposure = 2
  document.body.appendChild(renderer.domElement)
}

let spherePhong, sphereStandard
let materialPhong, materialStandard
const createSphare = () => {
  // const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256)
  // cubeRenderTarget.texture.type = THREE.HalfFloatType
  // cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget)

  // const PhysicalOption = {
  //   shininess: 10,
  // }
  // const mat02 = new THREE.MeshPhysicalMaterial(PhysicalOption)
  // const { map, normalMap, displacementMap  } = texture_moon
  const {
    normalMap,
    roughnessMap,
    colorMap,
    occMap,
    displacementMap,
  } = texture_lapis

  const bg = textureLoader.load('textrue/00.jpg')
  const PhongOption = {
    map: colorMap,
    normalMap,
    envMap: bg,
    // alphaMap,
    // occMap,
    // roughnessMap,
    // displacementMap,
    reflectivity: 0,
    shininess: 10,
    combine: 1,
    refractionRatio: 0,
    emissiveIntensity: 10,
  }
  // const StandardOption = {
  //   map,
  //   displacementMap,
  //   // roughnessMap,
  //   // envMap,
  //   normalMap,
  // }
  materialPhong = new THREE.MeshPhongMaterial(PhongOption) // 材質類型
  // materialStandard = new THREE.MeshStandardMaterial(StandardOption)
  const geometry = new THREE.SphereGeometry(6, 64, 64) // 多面體類型
  spherePhong = new THREE.Mesh(geometry, materialPhong) // 建立網絡
  // sphereStandard = new THREE.Mesh(geometry, materialStandard)
  scene.add(spherePhong)
}

const createBoxes = () => {
  // 方塊
  const BoxOption = {
    color: '#999999',
    // map,
    // envMap,
    // alphaMap,
    // normalMap,
    // reflectivity: 0,
    // shininess: 10,
    // combine: 1,
    // refractionRatio: 0,
  }
  const size = sizeScalar(7)
  // scene.add(cube)
  setInterval(() => {
    generateComet()
  }, 1000)
  const generateComet = () => {
    for (let i = 0; i <= 5; i++) {
      const geoBox = new THREE.BoxGeometry(size, size, size) // 長寬高
      const geoPhone = new THREE.SphereGeometry(size, size, size) // 長寬高
      const materialBox = new THREE.MeshPhongMaterial(BoxOption)
      const cube = new THREE.Mesh(geoBox, materialBox)
      cube.name = `cube-${i}`
      cube.position.set(scalar(i), scalar(i), -1250)
      cube.rotation.set(scalar(i), scalar(i), scalar(i))
      scene.add(cube)
    }
  }
}

let skyGeometry
let materialSky, skySphere
const createSkySphare = () => {
  skyGeometry = new THREE.SphereGeometry(CONSTANTS.SKY_SPHARE_SIZE, 24, 24)
  // Invert the geometry on the x-axis so that all of the faces point inward
  skyGeometry.scale(-1, 3, 3)
  backgroundTexture.encoding = THREE.sRGBEncoding
  materialSky = new THREE.MeshBasicMaterial({ map: backgroundTexture })
  skySphere = new THREE.Mesh(skyGeometry, materialSky)
  scene.add(skySphere)
}

const createEnvLight = () => {
  const ambientLight = new THREE.AmbientLight('#ffffff')
  scene.add(ambientLight)
}

const createSpotLight = () => {
  const spoltLight = new THREE.SpotLight('#fffdf7')
  spoltLight.position.set(1000, 600, 400) // 設定光源位置
  spoltLight.target = spherePhong // 設定光源目標
  scene.add(spoltLight)
}

const createHemisphereLight = () => {
  const hemiLight = new THREE.HemisphereLight('#ffffff', '#ffffff')
  hemiLight.position.set(0, 10, -30)
  scene.add(hemiLight)
}

const createDirectionalLight = () => {
  const dirLight = new THREE.DirectionalLight('#ffffff')
  dirLight.position.set(-3, 10, -10)
  scene.add(dirLight)
}

let clock
const setClock = () => {
  clock = new THREE.Clock()
}
setClock()

const setControls = () => {
  const controls = new OrbitControls(camera, renderer.domElement)
  camera.position.set(0, 200, 100)
  controls.target.set(0, -0.08, 0.11)
  controls.minDistance = CONSTANTS.CONTROLS_MIN_DISTANCE
  controls.maxDistance = CONSTANTS.CONTROLS_MAX_DISTANCE
  controls.update()
}

let flyControls
const setFlyControls = () => {
  flyControls = new FlyControls(camera, renderer.domElement)
  flyControls.movementSpeed = 300
  flyControls.domElement = renderer.domElement
  flyControls.rollSpeed = Math.PI / 6
  flyControls.autoForward = false
  flyControls.dragToLook = false
  flyControls.update(0)
}

const setGUI = () => {
  const gui = new GUI()
  const BasicFolder = gui.addFolder('Basic')
  BasicFolder.add(CONSTANTS, 'SKY_SPHARE_SIZE', 0, 1000).name('SKySphareSize')
  // BasicFolder.add(renderer, 'toneMappingExposure', 0, 2).name('Exposure')
  // gui.add( material, 'roughness', 0, 1 )
  const SphareFolder = gui.addFolder('Basic')
  // BasicFolder.add(materialPhong, 'roughnessMap', 0, 1)
  SphareFolder.add(materialPhong, 'reflectivity', 0, 1)
    .step(0.01)
    .name('Reflectivity')
  SphareFolder.add(materialPhong, 'emissiveIntensity', 0, 100)
    .step(1)
    .name('Emissive Intensity')
  const TextrueFolder = gui.addFolder('Textrue')
  TextrueFolder.add(materialPhong, 'shininess', 0, 1000)
    .step(0.01)
    .name('Shininess')
}

const animate = () => {
  requestAnimationFrame(animate)
  // spherePhong.rotation.y += 0.0005
  skySphere.rotation.x += 0.0003
  skySphere.rotation.y += 0.000001
  if (modelUFO) modelUFO.rotation.y += 0.04
  scene.children.forEach((c) => {
    const name = c.name.split('-')
    if (name[0] === 'cube') {
      c.rotation.x += 0.01
      c.rotation.y += 0.02
      c.rotation.z += 0.03
      // c.position.x -= 0.01
      // c.position.y -= 0.02
      c.position.z += 2
    }
    if (c.position.z >= 500) {
      scene.remove(c)
    }
  })
  renderer.autoClear = false
  renderer.clear()
  renderer.render(scene, camera)
}

const setActions = () => {
  const setForward = (e) => {
    // console.warn(e.keyCode)
    // if (e.keyCode === 38) {
    //   sphereStandard.position.y += 10
    // }
  }
  const traceDate = () => {
    // console.warn('clock delta', clock.getDelta())
  }
  document.onkeyup = traceDate
}

const setObjectMovement = () => {
  const target = modelUFO
  let xSpeed = 3
  let ySpeed = 3
  document.addEventListener(
    'keydown',
    function onDocumentKeyDown(event) {
      const keyCode = event.which
      if (keyCode === 38) {
        // 上
        target.position.y += ySpeed
      }
      if (keyCode === 40) {
        // 下
        target.position.y -= ySpeed
      }
      if (keyCode === 37) {
        // 左
        target.position.x -= xSpeed
      }
      if (keyCode === 39) {
        // 右
        target.position.x += xSpeed
      }
      console.warn('click', keyCode)
    },
    false,
  )
  document.addEventListener('mousemove', function (e) {
    const ww = window.innerWidth
    const wh = window.innerHeight
    const position3DX = e.clientX - ww / 2
    const position3DY = -(e.clientY - wh / 2)
    target.position.x = position3DX / 16
    target.position.y = position3DY / 16
    // console.warn(position3DX, position3DY)
  })
}

let modelUFO, modelDarkUFO
const load3DModels = () => {
  const loader = new GLTFLoader()
  loader.load(
    '../models/retro_ufo/scene.gltf',
    (gltf) => {
      modelUFO = gltf.scene
      modelUFO.scale.setScalar(10)
      modelUFO.position.y = 10
      scene.add(modelUFO)
      setObjectMovement()
      const mixer = new THREE.AnimationMixer(gltf.scene)
      // console.warn('mixer', mixer)
      // mixer.clipAction(gltf.animations[0]).play()
      // const mixer = new THREE.AnimationMixer(model)
      // const clip = THREE.AnimationClip.findByName(model.animations, 'run')
      // if (clip) {
      //   const action = mixer.clipAction(clip)
      //   action.play()
      // }
      // mixers.push(mixer)
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
      console.warn('An error happened')
    },
  )
}

const traceTarget = () => {
  console.warn('scene', scene)
  // setInterval(() => {
  //   console.warn('skySphere rotation', { ...skySphere.rotation })
  // }, 2000)
}

const init = () => {
  createScene()
  createCamera()
  createRenderer()
  // createSphare()
  createBoxes()
  load3DModels()
  createSkySphare()
  createEnvLight()
  // createSpotLight()
  createHemisphereLight()
  createDirectionalLight()
  // setClock()
  // setControls()
  // setFlyControls()
  // setGUI()
  animate()
  setActions()
  // setObjectMovement()
  traceTarget()
}

init()
