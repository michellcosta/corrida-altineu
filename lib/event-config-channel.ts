/**
 * BroadcastChannel para notificar atualização do evento.
 * Usado quando admin e site estão no mesmo navegador (fallback do Realtime).
 */
const CHANNEL_NAME = 'corrida-event-config'

export function notifyEventConfigUpdated() {
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      new BroadcastChannel(CHANNEL_NAME).postMessage('updated')
      if (process.env.NODE_ENV === 'development') {
        console.log('[EventConfig] Admin enviou notificação BroadcastChannel')
      }
    } catch {
      // Ignora se BroadcastChannel não suportado
    }
  }
}

export function onEventConfigUpdated(callback: () => void): () => void {
  if (typeof BroadcastChannel === 'undefined') return () => {}
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channel.onmessage = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[EventConfig] Site recebeu BroadcastChannel - disparando refetch')
      }
      // Pequeno delay para garantir que o DB commitou antes do refetch
      setTimeout(callback, 150)
    }
    return () => channel.close()
  } catch {
    return () => {}
  }
}
