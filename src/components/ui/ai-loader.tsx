'use client'

import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, useGLTF, useTexture, Sphere } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { useLoading } from '@/providers/LoadingProvider'
import { useTheme } from 'next-themes'
import { useDeviceType, useMediaQueryUserPreferences } from '@/hooks/useMediaQuerySelector'
import { cn } from '@/lib/utils'
import * as THREE from 'three'

// Neural Network Node component
function NeuralNode({ position, color, pulse = true, size = 0.2, opacity = 0.8 }) {
  const ref = useRef<THREE.Mesh>(null)
  const { prefersReducedMotion } = useMediaQueryUserPreferences()

  useFrame(({ clock }) => {
    if (ref.current && pulse && !prefersReducedMotion) {
      ref.current.scale.setScalar(
        size * (1 + 0.2 * Math.sin(clock.getElapsedTime() * 2 + position[0] * 5)),
      )
      ref.current.material.opacity =
        opacity * (0.7 + 0.3 * Math.sin(clock.getElapsedTime() * 3 + position[1] * 5))
    }
  })

  return (
    <Sphere args={[size, 16, 16]} position={position} ref={ref}>
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </Sphere>
  )
}

// Neural Network Connection component
function NeuralConnection({ start, end, color, width = 0.03, opacity = 0.3 }) {
  const ref = useRef<THREE.Mesh>(null)
  const { prefersReducedMotion } = useMediaQueryUserPreferences()

  // Calculate the midpoint and direction
  const direction = useMemo(() => {
    return new THREE.Vector3().subVectors(new THREE.Vector3(...end), new THREE.Vector3(...start))
  }, [start, end])

  const midPoint = useMemo(() => {
    return new THREE.Vector3(...start).add(direction.clone().multiplyScalar(0.5))
  }, [start, direction])

  const length = useMemo(() => direction.length(), [direction])

  useFrame(({ clock }) => {
    if (ref.current && !prefersReducedMotion) {
      // Animate data flow along the connection
      const t = clock.getElapsedTime()
      const offset = (Math.sin(t * 2 + start[0] * 10) + 1) / 2

      if (ref.current.material instanceof THREE.MeshBasicMaterial) {
        ref.current.material.opacity = opacity * (0.5 + 0.5 * offset)
      }
    }
  })

  // Create a cylinder between the two points
  return (
    <group position={midPoint.toArray()}>
      <mesh
        ref={ref}
        rotation={[0, 0, Math.atan2(direction.y, direction.x)]}
        scale={[length, width, width]}
      >
        <cylinderGeometry args={[1, 1, 1, 8, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
    </group>
  )
}

// Data Particle System
function DataParticles({ count = 50, color = '#4f46e5', bounds = 4 }) {
  const { prefersReducedMotion } = useMediaQueryUserPreferences()
  const { isMobile } = useDeviceType()

  // Reduce particle count on mobile
  const particleCount = isMobile ? Math.floor(count / 2) : count

  // Generate random particles
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map(() => ({
      position: [
        (Math.random() - 0.5) * bounds,
        (Math.random() - 0.5) * bounds,
        (Math.random() - 0.5) * bounds,
      ],
      speed: Math.random() * 0.2 + 0.1,
      size: Math.random() * 0.08 + 0.02,
      direction: [
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
      ],
    }))
  }, [particleCount, bounds])

  const particlesRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (particlesRef.current && !prefersReducedMotion) {
      particles.forEach((particle, i) => {
        // Update position based on direction and speed
        particle.position[0] += particle.direction[0] * particle.speed
        particle.position[1] += particle.direction[1] * particle.speed
        particle.position[2] += particle.direction[2] * particle.speed

        // Bounce off boundaries
        for (let j = 0; j < 3; j++) {
          if (Math.abs(particle.position[j]) > bounds / 2) {
            particle.direction[j] *= -1
          }
        }

        // Set instance position and scale
        dummy.position.set(...particle.position)
        dummy.scale.setScalar(particle.size * (1 + 0.3 * Math.sin(clock.getElapsedTime() * 2 + i)))
        dummy.updateMatrix()

        particlesRef.current.setMatrixAt(i, dummy.matrix)
      })

      particlesRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <instancedMesh ref={particlesRef} args={[undefined, undefined, particleCount]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </instancedMesh>
  )
}

// Neural Network Scene
function NeuralNetworkScene({ progress }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { prefersReducedMotion } = useMediaQueryUserPreferences()
  const { isMobile } = useDeviceType()

  // Colors based on theme
  const primaryColor = isDark ? '#6366f1' : '#4f46e5' // indigo
  const secondaryColor = isDark ? '#a855f7' : '#9333ea' // purple
  const tertiaryColor = isDark ? '#ec4899' : '#db2777' // pink
  const bgColor = isDark ? '#000000' : '#ffffff'

  // Create neural network nodes
  const nodeCount = isMobile ? 12 : 20
  const nodes = useMemo(() => {
    return Array.from({ length: nodeCount }).map((_, i) => {
      const angle = (i / nodeCount) * Math.PI * 2
      const radius = 2 + Math.random() * 0.5
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      const z = (Math.random() - 0.5) * 2

      return {
        position: [x, y, z],
        color: i % 3 === 0 ? primaryColor : i % 3 === 1 ? secondaryColor : tertiaryColor,
        size: 0.1 + Math.random() * 0.15,
      }
    })
  }, [nodeCount, primaryColor, secondaryColor, tertiaryColor])

  // Create connections between nodes
  const connections = useMemo(() => {
    const result = []
    for (let i = 0; i < nodes.length; i++) {
      // Connect to next 2-3 nodes
      for (let j = 1; j <= 2 + Math.floor(Math.random() * 2); j++) {
        const nextIndex = (i + j) % nodes.length
        result.push({
          start: nodes[i].position,
          end: nodes[nextIndex].position,
          color: i % 2 === 0 ? primaryColor : secondaryColor,
        })
      }

      // Add some random connections
      if (Math.random() > 0.7) {
        const randomIndex = Math.floor(Math.random() * nodes.length)
        if (randomIndex !== i) {
          result.push({
            start: nodes[i].position,
            end: nodes[randomIndex].position,
            color: tertiaryColor,
          })
        }
      }
    }
    return result
  }, [nodes, primaryColor, secondaryColor, tertiaryColor])

  // Rotate the entire network
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (groupRef.current && !prefersReducedMotion) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1
    }
  })

  // Set up camera and scene
  const { camera } = useThree()

  useEffect(() => {
    camera.position.z = isMobile ? 8 : 6
  }, [camera, isMobile])

  return (
    <>
      {/* Background color */}
      <color attach="background" args={[bgColor]} />

      {/* Central group with neural network */}
      <group ref={groupRef}>
        {/* Neural network nodes */}
        {nodes.map((node, i) => (
          <NeuralNode key={i} position={node.position} color={node.color} size={node.size} />
        ))}

        {/* Neural network connections */}
        {connections.map((connection, i) => (
          <NeuralConnection
            key={i}
            start={connection.start}
            end={connection.end}
            color={connection.color}
          />
        ))}

        {/* Central node (larger) */}
        <NeuralNode position={[0, 0, 0]} color={primaryColor} size={0.4} opacity={0.9} />

        {/* Data particles flowing through the network */}
        <DataParticles color={secondaryColor} />
      </group>

      {/* Progress text */}
      {progress > 0 && (
        <Text
          position={[0, -3, 0]}
          color={isDark ? '#ffffff' : '#000000'}
          fontSize={0.5}
          anchorX="center"
          anchorY="middle"
        >
          {`${Math.round(progress)}%`}
        </Text>
      )}
    </>
  )
}

// Main AI Loader component
export function AILoader() {
  const { isLoading, progress } = useLoading()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { prefersReducedMotion } = useMediaQueryUserPreferences()

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* WebGL Canvas */}
          <Canvas className="w-full h-full">
            <NeuralNetworkScene progress={progress} />
            {!prefersReducedMotion && <OrbitControls enableZoom={false} enablePan={false} />}
          </Canvas>

          {/* Overlay text */}
          <div className="absolute bottom-10 left-0 right-0 text-center">
            <motion.div
              className={cn('text-lg font-medium', isDark ? 'text-white' : 'text-gray-800')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Initializing AI Systems
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
