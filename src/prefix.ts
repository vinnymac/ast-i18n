let keyPrefix = '';

export function setKeyPrefix(prefix?: string) {
  keyPrefix = prefix ? `${prefix}.` : '';
}

export function getKeyPrefix() {
  return keyPrefix;
}
