import { ProductsTranslations } from '../translations'

interface ProductsHeaderProps {
  t: ProductsTranslations[keyof ProductsTranslations]
}

export function ProductsHeader({ t }: ProductsHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-foreground mb-4">
        {t.pageTitle}
      </h1>
      <p className="text-lg text-muted-foreground">
        {t.pageDescription}
      </p>
    </div>
  )
}