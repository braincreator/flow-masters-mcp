return (
  <footer className="border-t">
    <div className="container py-12 md:py-16 lg:py-20">
      <nav className="grid gap-8 md:gap-12">
        <ul className="flex flex-wrap gap-6 md:gap-8">
          {mainNavItems?.map(({ link }, i) => (
            <li key={i}>
              <CMSLink 
                {...link} 
                size="default"
                className="text-muted-foreground hover:text-foreground transition-colors" 
              />
            </li>
          ))}
        </ul>
        <ul className="flex flex-wrap gap-6 md:gap-8">
          {bottomNavItems?.map(({ link }, i) => (
            <li key={i}>
              <CMSLink 
                {...link} 
                size="sm"
                className="text-muted-foreground hover:text-foreground transition-colors" 
              />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </footer>
)