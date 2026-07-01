import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Viewer3D = React.forwardRef(({ settings, onComponentSelect, selectedComponent }, canvasRef) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const componentGroupRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 20;
    camera.position.y = 8;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    const boardGeometry = new THREE.PlaneGeometry(20, 20);
    const boardMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.3,
      roughness: 0.8
    });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.rotation.x = -Math.PI / 2;
    board.receiveShadow = true;
    scene.add(board);

    const gridHelper = new THREE.GridHelper(20, 20, 0x0f3460, 0x0f3460);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    const componentGroup = new THREE.Group();
    componentGroupRef.current = componentGroup;
    scene.add(componentGroup);

    fetch('/api/components')
      .then(res => res.json())
      .then(data => {
        data.components.forEach((comp, index) => {
          const compGeometry = new THREE.BoxGeometry(1.2, 0.6, 1.2);
          const compMaterial = new THREE.MeshStandardMaterial({
            color: settings.highlightPrecious ? 0xFFD700 : 0x888888,
            metalness: 0.8,
            roughness: 0.2
          });
          const component = new THREE.Mesh(compGeometry, compMaterial);
          component.castShadow = true;
          component.receiveShadow = true;
          component.position.set(
            (index % 3 - 1) * 5,
            0.3 + (Math.random() * 0.2),
            (Math.floor(index / 3) - 1) * 5
          );
          component.userData = comp;
          componentGroup.add(component);
        });
      })
      .catch(err => console.log('Component fetch error'));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x00ff88, 0.5, 20);
    pointLight.position.set(-10, 8, 10);
    scene.add(pointLight);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(componentGroup.children);

      if (intersects.length > 0) {
        const component = intersects[0].object;
        onComponentSelect(component.userData);
        component.material.emissive.setHex(0x00ff88);
        
        setTimeout(() => {
          component.material.emissive.setHex(0x000000);
        }, 300);
      }
    };

    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(componentGroup.children);

      componentGroup.children.forEach(child => {
        child.material.emissive.setHex(0x000000);
      });

      if (intersects.length > 0) {
        intersects[0].object.material.emissive.setHex(0x00aa66);
      }
    };

    window.addEventListener('click', onMouseClick);
    window.addEventListener('mousemove', onMouseMove);

    const handleResize = () => {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      requestAnimationFrame(animate);
      componentGroup.children.forEach((comp, i) => {
        comp.rotation.x += 0.001;
        comp.rotation.z += 0.002;
        comp.position.y += Math.sin(Date.now() * 0.001 + i) * 0.0005;
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('click', onMouseClick);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [settings, onComponentSelect]);

  return (
    <div ref={containerRef} className="viewer-3d" />
  );
});

export default Viewer3D;
