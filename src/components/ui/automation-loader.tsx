'use client'

import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Sphere, Line, Box } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { useLoading } from '@/providers/LoadingProvider'
import { useTheme } from 'next-themes'
import { useDeviceType, useMediaQueryUserPreferences } from '@/hooks/useMediaQuerySelector'
import { cn } from '@/lib/utils'
import * as THREE from 'three'

// Logic Gate component
function LogicGate({ position, rotation = [0, 0, 0], type = 'AND', color, scale = 1 }) {
  const ref = useRef<THREE.Group>(null)
  const { prefersReducedMotion } = useMediaQueryUserPreferences()

  useFrame(({ clock }) => {
    if (ref.current && !prefersReducedMotion) {
      // Subtle rotation animation
      ref.current.rotation.y = rotation[1] + Math.sin(clock.getElapsedTime() * 0.5) * 0.05
    }
  })

  return (
    <group position={position} rotation={rotation} ref={ref} scale={scale}>
      {/* Gate body */}
      <Box args={[0.8, 0.5, 0.2]} position={[0, 0, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </Box>
      
      {/* Gate label */}
      <Text
        position={[0, 0, 0.11]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {type}
      </Text>
      
      {/* Input/output connectors */}
      <Box args={[0.1, 0.1, 0.1]} position={[-0.45, 0.15, 0]}>
        <meshBasicMaterial color="#ffffff" />
      </Box>
      <Box args={[0.1, 0.1, 0.1]} position={[-0.45, -0.15, 0]}>
        <meshBasicMaterial color="#ffffff" />
      </Box>
      <Box args={[0.1, 0.1, 0.1]} position={[0.45, 0, 0]}>
        <meshBasicMaterial color="#ffffff" />
      </Box>
    </group>
  )
}

// Data Packet component
function DataPacket({ path, speed = 1, color = '#ffffff', size = 0.08 }) {
  const ref = useRef<THREE.Mesh>(null)
  const { prefersReducedMotion } = useMediaQueryUserPreferences()
  
  // Calculate path length for animation timing
  const pathLength = useMemo(() => {
    let length = 0
    for (let i = 1; i < path.length; i++) {
      const p1 = new THREE.Vector3(...path[i-1])
      const p2 = new THREE.Vector3(...path[i])
      length += p1.distanceTo(p2)
    }
    return length
  }, [path])
  
  useFrame(({ clock }) => {
    if (ref.current && !prefersReducedMotion) {
      // Calculate position along the path
      const time = clock.getElapsedTime() * speed
      const normalizedTime = (time % (pathLength / speed)) / (pathLength / speed)
      
      let currentSegment = 0
      let segmentStart = 0
      let segmentLength = 0
      
      // Find current segment
      for (let i = 1; i < path.length; i++) {
        const p1 = new THREE.Vector3(...path[i-1])
        const p2 = new THREE.Vector3(...path[i])
        const segDist = p1.distanceTo(p2)
        
        if (segmentStart + segDist > normalizedTime * pathLength) {
          currentSegment = i - 1
          segmentLength = segDist
          break
        }
        
        segmentStart += segDist
      }
      
      // Calculate position within segment
      const p1 = new THREE.Vector3(...path[currentSegment])
      const p2 = new THREE.Vector3(...path[currentSegment + 1])
      const segmentProgress = (normalizedTime * pathLength - segmentStart) / segmentLength
      
      // Interpolate position
      ref.current.position.lerpVectors(p1, p2, segmentProgress)
      
      // Pulse effect
      ref.current.scale.setScalar(size * (0.8 + 0.4 * Math.sin(time * 5)))
    }
  })
  
  return (
    <Sphere args={[size, 8, 8]} ref={ref} position={path[0]}>
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </Sphere>
  )
}

// Circuit Path component
function CircuitPath({ points, color = '#ffffff', width = 0.02, dashed = false }) {
  return (
    <Line
      points={points}
      color={color}
      lineWidth={width}
      dashed={dashed}
      dashSize={0.1}
      dashScale={1}
      dashOffset={0}
      transparent
      opacity={0.6}
    />
  )
}

// Processor Node component
function ProcessorNode({ position, color, size = 0.3, pulse = true }) {
  const ref = useRef<THREE.Mesh>(null)
  const { prefersReducedMotion } = useMediaQueryUserPreferences()

  useFrame(({ clock }) => {
    if (ref.current && pulse && !prefersReducedMotion) {
      // Pulse animation
      const t = clock.getElapsedTime()
      ref.current.scale.setScalar(size * (0.9 + 0.2 * Math.sin(t * 2)))
      
      if (ref.current.material instanceof THREE.MeshBasicMaterial) {
        ref.current.material.opacity = 0.8 + 0.2 * Math.sin(t * 3)
      }
    }
  })

  return (
    <Box args={[size, size, size]} position={position} ref={ref} rotation={[Math.PI/4, Math.PI/4, 0]}>
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </Box>
  )
}

// Main Automation Scene
function AutomationScene({ progress }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { prefersReducedMotion } = useMediaQueryUserPreferences()
  const { isMobile } = useDeviceType()
  const groupRef = useRef<THREE.Group>(null)

  // Colors based on theme
  const primaryColor = isDark ? '#6366f1' : '#4f46e5' // indigo
  const secondaryColor = isDark ? '#a855f7' : '#9333ea' // purple
  const tertiaryColor = isDark ? '#ec4899' : '#db2777' // pink
  const bgColor = isDark ? '#000000' : '#ffffff'
  const lineColor = isDark ? '#6366f180' : '#4f46e580'

  // Define circuit paths
  const circuitPaths = useMemo(() => {
    return [
      // Main horizontal path
      [[-3, 0, 0], [3, 0, 0]],
      // Vertical branches
      [[-2, 0, 0], [-2, 1.5, 0]],
      [[-2, 0, 0], [-2, -1.5, 0]],
      [[0, 0, 0], [0, 1.5, 0]],
      [[0, 0, 0], [0, -1.5, 0]],
      [[2, 0, 0], [2, 1.5, 0]],
      [[2, 0, 0], [2, -1.5, 0]],
      // Upper connections
      [[-2, 1.5, 0], [0, 1.5, 0]],
      [[0, 1.5, 0], [2, 1.5, 0]],
      // Lower connections
      [[-2, -1.5, 0], [0, -1.5, 0]],
      [[0, -1.5, 0], [2, -1.5, 0]],
    ]
  }, [])

  // Define data packet paths
  const dataPacketPaths = useMemo(() => {
    return [
      // Main flow path
      [[-3, 0, 0], [-2, 0, 0], [-2, 1.5, 0], [0, 1.5, 0], [0, 0, 0], [2, 0, 0], [2, -1.5, 0], [0, -1.5, 0], [-2, -1.5, 0], [-2, 0, 0], [3, 0, 0]],
      // Alternative path
      [[-3, 0, 0], [-2, 0, 0], [-2, -1.5, 0], [0, -1.5, 0], [0, 0, 0], [0, 1.5, 0], [2, 1.5, 0], [2, 0, 0], [3, 0, 0]],
    ]
  }, [])

  // Define logic gates
  const logicGates = useMemo(() => {
    return [
      { position: [-2, 1.5, 0], rotation: [0, 0, 0], type: 'AND', color: primaryColor, scale: 0.6 },
      { position: [0, 1.5, 0], rotation: [0, 0, 0], type: 'OR', color: secondaryColor, scale: 0.6 },
      { position: [2, 1.5, 0], rotation: [0, 0, 0], type: 'XOR', color: tertiaryColor, scale: 0.6 },
      { position: [-2, -1.5, 0], rotation: [0, 0, 0], type: 'NOT', color: tertiaryColor, scale: 0.6 },
      { position: [0, -1.5, 0], rotation: [0, 0, 0], type: 'NAND', color: secondaryColor, scale: 0.6 },
      { position: [2, -1.5, 0], rotation: [0, 0, 0], type: 'NOR', color: primaryColor, scale: 0.6 },
    ]
  }, [primaryColor, secondaryColor, tertiaryColor])

  // Define processor nodes
  const processorNodes = useMemo(() => {
    return [
      { position: [-2, 0, 0], color: primaryColor, size: 0.25 },
      { position: [0, 0, 0], color: secondaryColor, size: 0.25 },
      { position: [2, 0, 0], color: tertiaryColor, size: 0.25 },
    ]
  }, [primaryColor, secondaryColor, tertiaryColor])

  // Rotate the entire scene slowly
  useFrame(({ clock }) => {
    if (groupRef.current && !prefersReducedMotion) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.2
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.15) * 0.1
    }
  })

  return (
    <>
      {/* Background color */}
      <color attach="background" args={[bgColor]} />

      {/* Main automation circuit group */}
      <group ref={groupRef}>
        {/* Circuit paths */}
        {circuitPaths.map((points, i) => (
          <CircuitPath key={i} points={points} color={lineColor} width={0.03} />
        ))}

        {/* Logic gates */}
        {logicGates.map((gate, i) => (
          <LogicGate
            key={i}
            position={gate.position}
            rotation={gate.rotation}
            type={gate.type}
            color={gate.color}
            scale={gate.scale}
          />
        ))}

        {/* Processor nodes */}
        {processorNodes.map((node, i) => (
          <ProcessorNode
            key={i}
            position={node.position}
            color={node.color}
            size={node.size}
          />
        ))}

        {/* Data packets */}
        {dataPacketPaths.map((path, i) => (
          <DataPacket
            key={i}
            path={path}
            speed={0.5 + i * 0.3}
            color={i === 0 ? primaryColor : secondaryColor}
            size={0.08}
          />
        ))}
        
        {/* Add more data packets with different timings for a more dynamic feel */}
        {dataPacketPaths.map((path, i) => (
          <DataPacket
            key={`extra-${i}`}
            path={path}
            speed={0.7 + i * 0.4}
            color={i === 0 ? tertiaryColor : primaryColor}
            size={0.06}
          />
        ))}
      </group>

      {/* Progress text */}
      {progress > 0 && (
        <Text
          position={[0, -2.5, 0]}
          color={isDark ? '#ffffff' : '#000000'}
          fontSize={0.4}
          anchorX="center"
          anchorY="middle"
        >
          {`${Math.round(progress)}%`}
        </Text>
      )}
    </>
  )
}

// Main Automation Loader component
export function AutomationLoader() {
  const { isLoading, progress } = useLoading()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { prefersReducedMotion } = useMediaQueryUserPreferences()

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* WebGL Canvas */}
          <Canvas className="w-full h-full">
            <AutomationScene progress={progress} />
          </Canvas>

          {/* Overlay text */}
          <div className="absolute bottom-10 left-0 right-0 text-center">
            <motion.div
              className={cn('text-lg font-medium', isDark ? 'text-white' : 'text-gray-800')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Automating Processes
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
