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
                className="text-muted-foreground hover:text-warning transition-all duration-300
                  relative after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px 
                  after:bg-gradient-to-r after:from-warning/0 after:via-warning after:to-warning/0
                  after:opacity-0 after:transform after:scale-x-0
                  hover:after:opacity-100 hover:after:scale-x-100
                  after:transition-all after:duration-300" 
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
                className="text-muted-foreground hover:text-warning transition-all duration-300
                  relative after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px 
                  after:bg-gradient-to-r after:from-warning/0 after:via-warning after:to-warning/0
                  after:opacity-0 after:transform after:scale-x-0
                  hover:after:opacity-100 hover:after:scale-x-100
                  after:transition-all after:duration-300" 
              />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </footer>
)
