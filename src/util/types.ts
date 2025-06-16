export type ClientConfiguration = {
  NAMESPACE: string
  ENDPOINT: string
  RECONNECT_TIMEOUT: number
  CLIENT_STORAGE_NAMESPACE: string
}

export type StorageType = 'local' | 'session' | 'scope'

export type TrackerEvent = {
  key: string
  value: string | number | null
  session?: string
  window?: string
  client?: string
  time?: number
  content?: string
  crc?: string
}

export type PluginEventCallback = (event: TrackerEvent) => void

export type EventName = 'visibility' | 'breakpoint'

export type PluginEventCallbacks = {
  [key: string]: PluginEventCallback[]
}

export type ScrollTrackingDefaults = {
  THROTTLE_DELAY: number
  GAUGE_POINT_INTVERVAL: number
}

export type TrackingRect = {
  top: number
  right: number
  bottom: number
  left: number
  height: number
}

export type VisibilityEventOptions = {
  eventKey: string
  eventValue: string | number
  visibilityThreshold?: number
}

export type ScrollDepthEventOptions = {
  eventKey: string
  gaugePointInterval?: number | null
  id?: string
  value?: string | number
}

export type ThrottleOptions = { leading?: boolean; trailing?: boolean }
