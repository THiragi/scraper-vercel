import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export default async (req: VercelRequest, res: VercelResponse) => {
  const { query } = req;
  if (!query.url) return res.status(404).end();

  try {
    const url = Array.isArray(query.url) ? query.url[0] : query.url;
    const result = await fetch(url)
      .then((data) => data.text())
      .then((text) => {
        const dom = new JSDOM(text);
        const meta = dom.window.document.querySelectorAll(`head > meta`);

        return Array.from(meta)
          .filter((el) => el.hasAttribute('property'))
          .reduce((pre, ogp) => {
            const property = ogp
              .getAttribute('property')
              .trim()
              .replace('og:', '');
            const content = ogp.getAttribute('content');
            const obj = { [property]: content };

            return { ...pre, ...obj };
          }, {});
      });
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(500).end();
  }
};
