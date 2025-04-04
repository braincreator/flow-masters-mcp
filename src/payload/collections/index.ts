// Импортируем все созданные коллекции
import { Users } from './Users'
import { Media } from './Media'
import { Pages } from './Pages'
import { Posts } from './Posts'
import { Categories } from './Categories'
import { Tags } from './Tags'
import { Comments } from './Comments'
import { Redirects } from './Redirects'
import { NewsletterSubscribers } from './newsletter-subscribers'

// Экспортируем массив коллекций для использования при инициализации Payload
export const collections = [
  Users,
  Media,
  Pages,
  Posts,
  Categories,
  Tags,
  Comments,
  Redirects,
  NewsletterSubscribers,
]
