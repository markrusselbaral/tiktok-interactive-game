import orangeMeme from '@/cats_action/cat1/orange_cat_memes.gif'
import orangeVideo from '@/cats_action/cat1/video.mp4'
import orangeIdleRight from '@/cats_action/cat1/idle-right.png'
import orangeIdleLeft from '@/cats_action/cat1/idle-left.png'
import orangePunchRight from '@/cats_action/cat1/punch-right.png'
import orangePunchLeft from '@/cats_action/cat1/punch-left.png'
import orangeKickRight from '@/cats_action/cat1/kick-right.png'
import orangeKickLeft from '@/cats_action/cat1/kick-left.png'
import orangeHitRight from '@/cats_action/cat1/hit_reaction-right.png'
import orangeHitLeft from '@/cats_action/cat1/hit_reaction-left.png'
import orangeKoRight from '@/cats_action/cat1/ko-right.png'
import orangeKoLeft from '@/cats_action/cat1/ko-left.png'

import whiteMeme from '@/cats_action/cat2/white_cat_memes.gif'
import whiteVideo from '@/cats_action/cat2/video.mp4'
import whiteIdleRight from '@/cats_action/cat2/idle-right.png'
import whiteIdleLeft from '@/cats_action/cat2/idle-left.png'
import whitePunchRight from '@/cats_action/cat2/punch-right.png'
import whitePunchLeft from '@/cats_action/cat2/punch-left.png'
import whiteKickRight from '@/cats_action/cat2/kick-right.png'
import whiteKickLeft from '@/cats_action/cat2/kick-left.png'
import whiteHitRight from '@/cats_action/cat2/hit_reaction-right.png'
import whiteHitLeft from '@/cats_action/cat2/hit_reaction-left.png'
import whiteKoRight from '@/cats_action/cat2/ko-right.png'
import whiteKoLeft from '@/cats_action/cat2/ko-left.png'

export const cats = [
  {
    id: 'orange',
    name: 'Tangerine',
    evolvedName: 'Inferno Tangerine',
    color: '#ff8c42',
    evolvedColor: '#ff2e63',
    meme: orangeMeme,
    video: orangeVideo,
    gift: { name: 'Ice Cream Cone', icon: '🍦', match: /ice\s*cream/i },
    sprites: {
      idle: { right: orangeIdleRight, left: orangeIdleLeft },
      punch: { right: orangePunchRight, left: orangePunchLeft },
      kick: { right: orangeKickRight, left: orangeKickLeft },
      hit: { right: orangeHitRight, left: orangeHitLeft },
      ko: { right: orangeKoRight, left: orangeKoLeft },
    },
  },
  {
    id: 'white',
    name: 'Marshmallow',
    evolvedName: 'Frostbite Marshmallow',
    color: '#a8dadc',
    evolvedColor: '#48cae4',
    meme: whiteMeme,
    video: whiteVideo,
    gift: { name: 'Rose', icon: '🌹', match: /rose/i },
    sprites: {
      idle: { right: whiteIdleRight, left: whiteIdleLeft },
      punch: { right: whitePunchRight, left: whitePunchLeft },
      kick: { right: whiteKickRight, left: whiteKickLeft },
      hit: { right: whiteHitRight, left: whiteHitLeft },
      ko: { right: whiteKoRight, left: whiteKoLeft },
    },
  },
]
