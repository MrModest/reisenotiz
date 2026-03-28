export interface Timezone {
  iana: string
  offset: string
}

export const TzUtils = {
  local: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
  utc: 'Etc/Utc',
}
