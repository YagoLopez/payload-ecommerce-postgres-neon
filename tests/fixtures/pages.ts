import type { Page } from '@/payload-types'

export const mockPage: Page = {
  id: 1,
  title: 'Test Page',
  publishedOn: '2024-01-01T00:00:00.000Z',
  hero: {
    type: 'highImpact',
    richText: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Test Page Hero',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h1',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    links: null,
    media: null,
  },
  layout: [
    {
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: 'This is a test page content.',
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
          enableLink: false,
          id: 'test-content-column-1',
        },
      ],
      id: 'test-content-block',
      blockName: 'Test Content Block',
    },
    {
      blockType: 'cta',
      richText: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Ready to get started?',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      links: [
        {
          link: {
            type: 'custom',
            newTab: false,
            reference: null,
            url: '/contact',
            label: 'Contact Us',
            appearance: 'default',
          },
          id: 'test-cta-link',
        },
      ],
      id: 'test-cta-block',
      blockName: 'Test CTA Block',
    },
  ],
  meta: {
    title: 'Test Page',
    description: 'A test page for unit testing',
    image: null,
  },
  slug: 'test-page',
  slugLock: null,
  updatedAt: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  _status: 'published',
}

export const mockPageDraft: Page = {
  ...mockPage,
  id: 2,
  title: 'Draft Page',
  slug: 'draft-page',
  _status: 'draft',
  meta: {
    title: 'Draft Page',
    description: 'A draft page for testing',
    image: null,
  },
}

export const mockPageEmptyLayout: Page = {
  ...mockPage,
  id: 3,
  title: 'Empty Layout Page',
  slug: 'empty-layout-page',
  layout: [],
}

export const mockPayloadFindResultPages = {
  docs: [mockPage],
  totalDocs: 1,
  hasNextPage: false,
  hasPrevPage: false,
  limit: 10,
  page: 1,
  totalPages: 1,
  pager: {
    prev: null,
    next: null,
  },
}

export const mockEmptyPayloadFindResultPages = {
  docs: [],
  totalDocs: 0,
  hasNextPage: false,
  hasPrevPage: false,
  limit: 10,
  page: 1,
  totalPages: 0,
  pager: {
    prev: null,
    next: null,
  },
}

export const mockMultiplePagesResult = {
  docs: [mockPage, mockPageDraft, mockPageEmptyLayout],
  totalDocs: 3,
  hasNextPage: false,
  hasPrevPage: false,
  limit: 10,
  page: 1,
  totalPages: 1,
  pager: {
    prev: null,
    next: null,
  },
}
