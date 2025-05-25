import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const TGDCollage3D = () => {
  // Modal image state for simple modal solution
  const [modalImage, setModalImage] = useState(null);
  const [isRotating, setIsRotating] = useState(true);
  const [visualizationMode, setVisualizationMode] = useState('fibonacci'); // Default mode
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const imageGroupRef = useRef(null);
  const imageObjectsRef = useRef([]);
  const raycasterRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2());
  const animationRef = useRef(null);
  const updateVisualizationModeRef = useRef(null);

  // Disable page scrolling when modal is open
  useEffect(() => {
    if (modalImage) {
      document.body.classList.add('modal-open-no-scroll');
    } else {
      document.body.classList.remove('modal-open-no-scroll');
    }
    
    // Cleanup function to remove the class if the component unmounts while modal is open
    return () => {
      document.body.classList.remove('modal-open-no-scroll');
    };
  }, [modalImage]);

  // Function to create a circular, blurred particle texture
  const createStarTexture = () => {
    const canvas = document.createElement('canvas');
    const size = 64; // Texture size
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.4, 'rgba(200,200,255,0.5)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // Generate spherical coordinates using Fibonacci sphere algorithm (original working version)
  const generateSphericalPositions = (imageCount, radius = 15) => {
    const positions = [];
    const golden = (1 + Math.sqrt(5)) / 2; // Golden ratio
    
    for (let i = 0; i < imageCount; i++) {
      const y = 1 - (i / (imageCount - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      
      const theta = golden * i; // Golden angle increment
      
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      
      positions.push([x * radius, y * radius, z * radius]);
    }
    
    return positions;
  };

  // Generate 3D spherical lattice positions in concentric spherical layers
  const generateLatticePositions = (imageCount, baseRadius = 8) => {
    const positions = [];
    const golden = (1 + Math.sqrt(5)) / 2; // Golden ratio for optimal distribution
    
    // Calculate how many concentric spheres we need
    const spheresCount = Math.ceil(Math.cbrt(imageCount / 4)); // Rough estimate
    let imagesPlaced = 0;
    
    for (let sphereIndex = 0; sphereIndex < spheresCount && imagesPlaced < imageCount; sphereIndex++) {
      const sphereRadius = baseRadius + (sphereIndex * 4); // Each sphere 4 units apart
      
      // Calculate images for this sphere based on surface area
      const imagesInThisSphere = sphereIndex === 0 ? 1 : Math.min(
        Math.floor(4 * Math.PI * sphereRadius * sphereRadius / 15), // Surface area based distribution
        imageCount - imagesPlaced
      );
      
      if (sphereIndex === 0) {
        // Center image
        positions.push([0, 0, 0]);
        imagesPlaced++;
      } else {
        // Distribute images on sphere surface using Fibonacci sphere
        for (let i = 0; i < imagesInThisSphere; i++) {
          const y = 1 - (i / (imagesInThisSphere - 1)) * 2; // y goes from 1 to -1
          const radiusAtY = Math.sqrt(1 - y * y);
          
          const theta = golden * (i + sphereIndex * 100); // Offset for each sphere
          
          const x = Math.cos(theta) * radiusAtY * sphereRadius;
          const z = Math.sin(theta) * radiusAtY * sphereRadius;
          
          positions.push([x, y * sphereRadius, z]);
          imagesPlaced++;
          
          if (imagesPlaced >= imageCount) break;
        }
      }
    }
    
    return positions.slice(0, imageCount);
  };

  // Generate typography positions for letters T, G, D
  const generateTypographyPositions = (imageCount) => {
    const positions = [];
    const letterSpacing = 12;
    const letterWidth = 8;
    const letterHeight = 12;
    
    // Define letter shapes using point patterns
    const letterT = [
      // Top horizontal bar
      [-3, 5, 0], [-2, 5, 0], [-1, 5, 0], [0, 5, 0], [1, 5, 0], [2, 5, 0], [3, 5, 0],
      // Vertical bar
      [0, 4, 0], [0, 3, 0], [0, 2, 0], [0, 1, 0], [0, 0, 0], [0, -1, 0], [0, -2, 0], [0, -3, 0], [0, -4, 0], [0, -5, 0]
    ];
    
    const letterG = [
      // Outer curve
      [-2, 4, 0], [-3, 3, 0], [-3, 2, 0], [-3, 1, 0], [-3, 0, 0], [-3, -1, 0], [-3, -2, 0], [-3, -3, 0], [-2, -4, 0],
      // Top and bottom horizontal
      [-1, 4, 0], [0, 4, 0], [1, 4, 0], [2, 4, 0],
      [-1, -4, 0], [0, -4, 0], [1, -4, 0], [2, -4, 0],
      // Right side and inner horizontal
      [3, 3, 0], [3, 2, 0], [3, 1, 0], [3, 0, 0], [3, -1, 0], [3, -2, 0], [3, -3, 0],
      [1, 0, 0], [2, 0, 0]
    ];
    
    const letterD = [
      // Left vertical bar
      [-3, 5, 0], [-3, 4, 0], [-3, 3, 0], [-3, 2, 0], [-3, 1, 0], [-3, 0, 0], [-3, -1, 0], [-3, -2, 0], [-3, -3, 0], [-3, -4, 0], [-3, -5, 0],
      // Top and bottom horizontal
      [-2, 5, 0], [-1, 5, 0], [0, 5, 0], [1, 5, 0],
      [-2, -5, 0], [-1, -5, 0], [0, -5, 0], [1, -5, 0],
      // Right curve
      [2, 4, 0], [3, 3, 0], [3, 2, 0], [3, 1, 0], [3, 0, 0], [3, -1, 0], [3, -2, 0], [3, -3, 0], [2, -4, 0]
    ];
    
    // Position letters with spacing
    const allLetters = [
      ...letterT.map(([x, y, z]) => [x - letterSpacing, y, z]),
      ...letterG.map(([x, y, z]) => [x, y, z]),
      ...letterD.map(([x, y, z]) => [x + letterSpacing, y, z])
    ];
    
    // Fill remaining positions with random distribution around letters
    let letterIndex = 0;
    for (let i = 0; i < imageCount; i++) {
      if (letterIndex < allLetters.length) {
        positions.push(allLetters[letterIndex]);
        letterIndex++;
      } else {
        // Add random positions around the letters
        const randomX = (Math.random() - 0.5) * 40;
        const randomY = (Math.random() - 0.5) * 20;
        const randomZ = (Math.random() - 0.5) * 10;
        positions.push([randomX, randomY, randomZ]);
      }
    }
    
    return positions;
  };

  // Get positions based on current visualization mode
  const getPositionsForMode = (imageCount, mode) => {
    switch (mode) {
      case 'lattice':
        return generateLatticePositions(imageCount);
      case 'typography':
        return generateTypographyPositions(imageCount);
      case 'fibonacci':
      default:
        return generateSphericalPositions(imageCount, 15); // Use radius of 15
    }
  };

  // Get all available images using actual filenames
  const getImagePaths = () => {
    const baseFilename = "Digital painting, abstract representation of memory in Topological Geometrodynamics, intricate network of nodes and paths, intense dramatic lighting, high contrast, dark tones, unsettling details, vibrant mysterious hues";
    const paths = [];
    
    // Add the base filename without number
    paths.push(`/images/${baseFilename}.jpg`);
    
    // Add numbered files (1) through (100)
    for (let i = 1; i <= 100; i++) {
      paths.push(`/images/${baseFilename} (${i}).jpg`);
    }
    
    return paths;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000510); // Deep space background
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 25;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Raycaster for mouse interactions
    const raycaster = new THREE.Raycaster();
    raycasterRef.current = raycaster;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add point lights for better illumination
    const pointLight1 = new THREE.PointLight(0x00ffff, 0.5, 50);
    pointLight1.position.set(20, 20, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 0.3, 50);
    pointLight2.position.set(-20, -20, -20);
    scene.add(pointLight2);

    // Group to hold all images for easy rotation
    const imageGroup = new THREE.Group();
    imageGroupRef.current = imageGroup;
    scene.add(imageGroup);

    // Add stars background with more blur and contrast
    const starTexture = createStarTexture(); // Create the custom texture
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 1500; // Reduced star count
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);
    const sizes = new Float32Array(starsCount); // For individual star sizes

    for (let i = 0; i < starsCount; i++) {
      const i3 = i * 3;
      // Create much larger background sphere
      positions[i3] = (Math.random() - 0.5) * 350; // Slightly smaller radius for stars
      positions[i3 + 1] = (Math.random() - 0.5) * 350;
      positions[i3 + 2] = (Math.random() - 0.5) * 350;

      // Add subtle color variation for more contrast
      const brightness = Math.random() * 0.2 + 0.05; // Reduced brightness
      colors[i3] = brightness * 1.2; // R
      colors[i3 + 1] = brightness * 1.1; // G
      colors[i3 + 2] = brightness * 1.5; // B (more blueish)
      
      sizes[i] = Math.random() * 1.0 + 0.3; // Smaller, less varied sizes
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1)); // Add size attribute

    const starsMaterial = new THREE.PointsMaterial({
      map: starTexture, // Use the custom texture
      vertexColors: true,
      // size: 0.8, // Base size, will be multiplied by attribute if sizeAttenuation is false
      transparent: true,
      opacity: 0.7, // Adjusted opacity
      blending: THREE.AdditiveBlending,
      depthWrite: false, // Important for transparent particles
      sizeAttenuation: true, // Sizes attenuate with distance
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Create images in spherical formation
    const imagePaths = getImagePaths();
    const sphericalPositions = getPositionsForMode(imagePaths.length, visualizationMode);
    const loader = new THREE.TextureLoader();
    const imageObjects = [];
    let loadedImages = 0;

    // Function to update image positions based on visualization mode
    const updateImagePositions = (newMode) => {
      const newPositions = getPositionsForMode(imagePaths.length, newMode);
      
      imageObjectsRef.current.forEach((mesh, index) => {
        if (mesh.userData.isImage && index < newPositions.length) {
          const [x, y, z] = newPositions[index];
          
          // Animate to new position
          const startPos = mesh.position.clone();
          const targetPos = new THREE.Vector3(x, y, z);
          const startTime = Date.now();
          const duration = 1000;

          const animatePosition = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeInOutCubic(progress);

            mesh.position.lerpVectors(startPos, targetPos, eased);
            
            // Update stored original position
            mesh.userData.originalPosition = { x, y, z };
            
            // Make images face camera in lattice mode, or face center in others
            if (newMode === 'lattice') {
              mesh.lookAt(cameraRef.current.position);
            } else {
              mesh.lookAt(0, 0, 0);
            }

            if (progress < 1) {
              requestAnimationFrame(animatePosition);
            }
          };
          
          animatePosition();
        }
      });
    };

    // Store the update function for external access
    window.updateVisualizationMode = updateImagePositions;

    // Load and create image meshes
    imagePaths.forEach((imagePath, index) => {
      if (index >= sphericalPositions.length) return;

      const geometry = new THREE.PlaneGeometry(1.8, 1.8);
      
      loader.load(
        imagePath,
        (texture) => {
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          
          // Create material with a subtle glow effect instead of separate border mesh
          const material = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            emissive: 0x1a3a5c, // Subtle blue glow
            emissiveIntensity: 0.2
          });

          const mesh = new THREE.Mesh(geometry, material);
          const [x, y, z] = sphericalPositions[index];
          
          mesh.position.set(x, y, z);
          
          // Make image face appropriate direction based on mode
          if (visualizationMode === 'lattice') {
            mesh.lookAt(camera.position);
          } else {
            mesh.lookAt(0, 0, 0);
          }
          
          // Store reference data
          mesh.userData = {
            index,
            imagePath,
            originalPosition: { x, y, z },
            originalScale: { x: 1, y: 1, z: 1 },
            isImage: true
          };

          imageGroup.add(mesh);
          imageObjects.push(mesh);
          
          loadedImages++;
          setLoadingProgress((loadedImages / imagePaths.length) * 100);
          
          if (loadedImages === imagePaths.length) {
            setIsLoaded(true);
          }
        },
        undefined,
        (error) => {
          console.warn(`Failed to load image: ${imagePath}`, error);
          loadedImages++;
          setLoadingProgress((loadedImages / imagePaths.length) * 100);
          
          if (loadedImages === imagePaths.length) {
            setIsLoaded(true);
          }
        }
      );
    });

    imageObjectsRef.current = imageObjects;

    // Mouse event handlers
    const handleMouseMove = (event) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleClick = (event) => {
      if (!raycasterRef.current || !cameraRef.current || modalImage) return; // Disable clicking when modal is open

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(
        imageObjectsRef.current.filter(obj => obj.userData.isImage)
      );

      if (intersects.length > 0) {
        const clicked = intersects[0].object;
        // Set modal image data - store both the index and image path
        setModalImage({
          index: clicked.userData.index,
          path: clicked.userData.imagePath
        });
      }
    };

    // (Removed complex animation functions - using simple modal instead)

    // Function to update visualization mode
    const updateVisualizationMode = (newMode) => {
      if (!imageObjectsRef.current || imageObjectsRef.current.length === 0) return;

      let newPositions = [];
      
      switch(newMode) {
        case 'fibonacci':
          newPositions = generateSphericalPositions(imageObjectsRef.current.length);
          break;
        case 'lattice':
          newPositions = generateLatticePositions(imageObjectsRef.current.length);
          break;
        case 'typography':
          newPositions = generateTypographyPositions(imageObjectsRef.current.length);
          break;
        default:
          newPositions = generateSphericalPositions(imageObjectsRef.current.length);
      }

      // Animate to new positions
      imageObjectsRef.current.forEach((mesh, index) => {
        if (mesh.userData.isImage && newPositions[index]) {
          const [x, y, z] = newPositions[index];
          
          // Store new original position
          mesh.userData.originalPosition = { x, y, z };
          
          // Animate to new position
          const startPos = mesh.position.clone();
          const targetPos = new THREE.Vector3(x, y, z);
          const startTime = Date.now();
          const duration = 1500;

          const animatePosition = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeInOutCubic(progress);

            mesh.position.lerpVectors(startPos, targetPos, eased);

            if (progress < 1) {
              requestAnimationFrame(animatePosition);
            }
          };

          animatePosition();
        }
      });
    };

    // (Removed holographic and frame functions - using simple modal instead)

    // Easing function
    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    // Mouse controls for rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (event) => {
      if (modalImage) return; // Disable interaction when modal is open
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseDrag = (event) => {
      if (!isDragging || modalImage) return; // Disable interaction when modal is open

      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };

      const deltaRotationQuaternion = new THREE.Quaternion()
        .setFromEuler(new THREE.Euler(
          toRadians(deltaMove.y * 0.3),
          toRadians(deltaMove.x * 0.3),
          0,
          'XYZ'
        ));

      imageGroup.quaternion.multiplyQuaternions(deltaRotationQuaternion, imageGroup.quaternion);
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const toRadians = (angle) => {
      return angle * (Math.PI / 180);
    };

    // Wheel event for zoom
    const handleWheel = (event) => {
      if (modalImage) return; // Disable zoom when modal is open
      event.preventDefault();
      const delta = event.deltaY * 0.01;
      camera.position.z = Math.max(10, Math.min(50, camera.position.z + delta));
    };

    // Event listeners
    mountRef.current.addEventListener('mousemove', handleMouseMove);
    mountRef.current.addEventListener('click', handleClick);
    mountRef.current.addEventListener('mousedown', handleMouseDown);
    mountRef.current.addEventListener('mouseup', handleMouseUp);
    mountRef.current.addEventListener('mousemove', handleMouseDrag);
    mountRef.current.addEventListener('wheel', handleWheel);

    mountRef.current.appendChild(renderer.domElement);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      // Auto-rotate the sphere continuously (only when modal is not open)
      if (isRotating && imageGroupRef.current && !modalImage) {
        imageGroupRef.current.rotation.y += 0.0005; // Slow rotation
        imageGroupRef.current.rotation.x += 0.0003;
      }

      // Gentle floating animation for images (only when modal is not open)
      if (!modalImage) {
        const time = Date.now() * 0.0002;
        imageObjectsRef.current.forEach((mesh) => {
          if (mesh.userData.isImage) {
            const yOffset = Math.sin(time + mesh.userData.index * 0.5) * 0.1;
            mesh.position.y = (mesh.userData.originalPosition?.y || 0) + yOffset;

            // Make all images always face the camera for better visibility
            if (cameraRef.current) {
              mesh.lookAt(cameraRef.current.position);
            }
          }
        });
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Set the ref for external access to updateVisualizationMode
    updateVisualizationModeRef.current = updateVisualizationMode;

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Remove event listeners
      if (mountRef.current) {
        mountRef.current.removeEventListener('mousemove', handleMouseMove);
        mountRef.current.removeEventListener('click', handleClick);
        mountRef.current.removeEventListener('mousedown', handleMouseDown);
        mountRef.current.removeEventListener('mouseup', handleMouseUp);
        mountRef.current.removeEventListener('mousemove', handleMouseDrag);
        mountRef.current.removeEventListener('wheel', handleWheel);
      }
      
      window.removeEventListener('resize', handleResize);
      
      // Dispose of Three.js objects
      imageObjectsRef.current.forEach(mesh => {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
        if (mesh.userData.glowMesh) {
          mesh.userData.glowMesh.geometry.dispose();
          mesh.userData.glowMesh.material.dispose();
        }
      });
      
      renderer.dispose();
    };
  }, [isRotating, visualizationMode, modalImage]);

  // Handle visualization mode change
  const handleVisualizationChange = (newMode) => {
    setVisualizationMode(newMode);
    setIsRotating(true);
    
    // Update positions immediately if the component is mounted
    if (imageObjectsRef.current && imageObjectsRef.current.length > 0) {
      setTimeout(() => {
        updateVisualizationModeRef.current(newMode);
      }, 100);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Loading screen */}
      {!isLoaded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-xl font-medium mb-2">Loading TGD Memory Lattice</div>
            <div className="text-sm text-gray-300">
              {Math.round(loadingProgress)}% ({Math.round(loadingProgress * 1.01)}/101 memories loaded)
            </div>
            <div className="w-64 h-2 bg-gray-700 rounded-full mt-4 mx-auto">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 to-purple-400 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Controls panel */}
      <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur-md rounded-lg p-4 text-white max-w-xs">
        <h2 className="text-lg font-bold mb-2 text-sky-400">TGD Memory Lattice</h2>
        
        {/* Visualization Mode Selector */}
        <div className="mb-4 pb-3 border-b border-gray-600">
          <div className="text-xs text-gray-400 mb-2">Visualization Mode</div>
          <div className="space-y-1">
            <button
              onClick={() => handleVisualizationChange('fibonacci')}
              className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                visualizationMode === 'fibonacci' 
                  ? 'bg-sky-500 text-white' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              Fibonacci Sphere
            </button>
            <button
              onClick={() => handleVisualizationChange('lattice')}
              className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                visualizationMode === 'lattice' 
                  ? 'bg-sky-500 text-white' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              3D Spherical Lattice
            </button>
            <button
              onClick={() => handleVisualizationChange('typography')}
              className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                visualizationMode === 'typography' 
                  ? 'bg-sky-500 text-white' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              TGD Typography
            </button>
          </div>
        </div>
        
        <div className="space-y-1 text-sm text-gray-300">
          <div>• Click images to view</div>
          <div>• Drag to rotate sphere</div>
          <div>• Scroll to zoom in/out</div>
          <div>• 101 quantum memories loaded</div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">Auto-rotating</span>
          </div>
        </div>
      </div>

      {/* Modal for selected image */}
      {modalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-screen p-4">
            {/* Close button */}
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full text-xl transition-colors"
            >
              ×
            </button>
            
            {/* Image */}
            <img
              src={modalImage.path}
              alt={`TGD Memory Fragment ${modalImage.index + 1}`}
              className="max-w-full max-h-screen rounded-lg shadow-2xl"
            />
            
            {/* Image info */}
            <div className="absolute bottom-6 left-6 right-6 bg-black/70 backdrop-blur-md rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-purple-400">TGD Memory Fragment</h3>
                <div className="text-sky-400 font-mono">TGD-{(modalImage.index + 1).toString().padStart(3, '0')}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-400">Position in Lattice</div>
                  <div className="text-purple-400">{modalImage.index + 1} of 101</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Quantum State</div>
                  <div className="text-green-400">Coherent</div>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-300">
                Abstract representation of memory in Topological Geometrodynamics - 
                a visualization of quantum coherence patterns in spacetime geometry.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas container */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};

export default TGDCollage3D;
