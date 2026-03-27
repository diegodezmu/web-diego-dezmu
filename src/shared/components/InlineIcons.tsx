import type { ComponentPropsWithoutRef, ReactNode } from 'react'

type IconProps = ComponentPropsWithoutRef<'svg'>

function SvgIcon({
  children,
  viewBox,
  ...props
}: IconProps & {
  children: ReactNode
  viewBox: string
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      height="100%"
      viewBox={viewBox}
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {children}
    </svg>
  )
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <SvgIcon viewBox="0 0 32 32" {...props}>
      <path
        d="M19.4873 8.46162L11.9283 16.0206L19.4873 23.5923L20.5743 22.505L14.1027 16.0206L20.5743 9.54862L19.4873 8.46162Z"
        fill="currentColor"
      />
    </SvgIcon>
  )
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <SvgIcon viewBox="0 0 32 32" {...props}>
      <path
        d="M12.5127 8.46162L20.0717 16.0206L12.5127 23.5923L11.4257 22.505L17.8973 16.0206L11.4257 9.54862L12.5127 8.46162Z"
        fill="currentColor"
      />
    </SvgIcon>
  )
}

export function ZoomInIcon(props: IconProps) {
  return (
    <SvgIcon viewBox="0 -960 960 960" {...props}>
      <path
        d="M459.54-290h45.38v-164.46H670v-45.39H504.92V-670h-45.38v170.15H290v45.39h169.54V-290Zm20.79 190q-78.95 0-147.89-29.92-68.95-29.92-120.76-81.71-51.81-51.79-81.75-120.78Q100-401.39 100-480.43q0-78.66 29.92-147.87 29.92-69.21 81.71-120.52 51.79-51.31 120.78-81.25Q401.39-860 480.43-860q78.66 0 147.87 29.92 69.21 29.92 120.52 81.21 51.31 51.29 81.25 120.63Q860-558.9 860-480.33q0 78.95-29.92 147.89-29.92 68.95-81.21 120.57-51.29 51.63-120.63 81.75Q558.9-100 480.33-100Zm.17-45.39q139.19 0 236.65-97.76 97.46-97.77 97.46-237.35 0-139.19-97.27-236.65-97.27-97.46-237.34-97.46-139.08 0-236.85 97.27-97.76 97.27-97.76 237.34 0 139.08 97.76 236.85 97.77 97.76 237.35 97.76ZM480-480Z"
        fill="currentColor"
      />
    </SvgIcon>
  )
}

export function ZoomOutIcon(props: IconProps) {
  return (
    <SvgIcon viewBox="0 -960 960 960" {...props}>
      <path
        d="M290-459.54h380v-45.38H290v45.38ZM480.07-100q-78.22 0-147.4-29.92t-120.99-81.71q-51.81-51.79-81.75-120.94Q100-401.71 100-479.93q0-78.84 29.92-148.21t81.71-120.68q51.79-51.31 120.94-81.25Q401.71-860 479.93-860q78.84 0 148.21 29.92t120.68 81.21q51.31 51.29 81.25 120.63Q860-558.9 860-480.07q0 78.22-29.92 147.4t-81.21 120.99q-51.29 51.81-120.63 81.75Q558.9-100 480.07-100Zm-.07-45.39q139.69 0 237.15-97.76 97.46-97.77 97.46-236.85 0-139.69-97.46-237.15-97.46-97.46-237.15-97.46-139.08 0-236.85 97.46-97.76 97.46-97.76 237.15 0 139.08 97.76 236.85 97.77 97.76 236.85 97.76ZM480-480Z"
        fill="currentColor"
      />
    </SvgIcon>
  )
}
