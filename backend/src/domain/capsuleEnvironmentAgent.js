/**
 * Agent 14: Capsule Environment Agent
 * Role: Coordinate physical capsule systems (Locks, UV-C sterilizers, lighting and HVAC fans).
 * 
 * @param {string} action - Environment state directive (lock, sanitize, ready, emergency).
 * @returns {Object} Target states and system notification text.
 */
export function capsuleEnvironmentAgent(action) {
  const states = {
    lock: { doorLocked: true, uvcActive: false, lightingColor: 'blue', ventilationSpeed: 65 },
    sanitize: { doorLocked: true, uvcActive: true, lightingColor: 'purple', ventilationSpeed: 100 },
    ready: { doorLocked: false, uvcActive: false, lightingColor: 'green', ventilationSpeed: 45 },
    emergency: { doorLocked: true, uvcActive: false, lightingColor: 'red', ventilationSpeed: 80 }
  };

  return {
    agent: 'Capsule Environment Agent',
    state: states[action] || states['ready'],
    message: {
      lock: 'Door secured. HVAC and calming blue lighting activated.',
      sanitize: 'UV-C sterilization lamps: ACTIVATED. HEPA ventilation at 100%. Disinfection cycle running.',
      ready: 'Sanitization complete. Capsule sterile. Ambient green lighting restored. Ready for next patient.',
      emergency: 'Emergency protocol active. Red alert lighting. High-flow ventilation engaged.'
    }[action] || 'State updated.',
    color: '#9d4edd'
  };
}
