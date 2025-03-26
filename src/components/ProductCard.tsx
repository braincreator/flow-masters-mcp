<Button
  className="w-full glass-effect interactive-element
           relative overflow-hidden group
           dark:border dark:border-primary/30 dark:hover:border-primary/50"
  onClick={() => onAddToCart?.(product)}
>
  <ShoppingCart className="w-5 h-5 mr-2" />
  Add to Cart
  <div
    className="absolute inset-0 bg-gradient-to-r from-transparent 
             via-white/20 to-transparent opacity-0 
             group-hover:opacity-100 transition-opacity duration-300 
             -translate-x-full group-hover:translate-x-full
             dark:from-transparent dark:via-primary/20 dark:to-transparent"
  />
</Button> 