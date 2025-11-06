import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import React from 'react'

interface Props {
  menu: Footer['navItems']
}

export function FooterMenu({ menu }: Props) {
  if (!menu?.length) return null

  return (
    <nav>
      <ul className="md:flex flex-wrap items-center gap-x-8 gap-y-4">
        {menu.map((item) => {
          return (
            <li key={item.id}>
              <CMSLink appearance="link" {...item.link} className="text-lg" />
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
