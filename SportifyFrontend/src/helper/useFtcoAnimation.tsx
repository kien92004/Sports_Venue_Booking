import { useEffect } from "react";

export const useFtcoAnimation = (loading: boolean) => {
  useEffect(() => {
    if (!loading) {
      const initAnimations = () => {
        const $ = (window as any).$;
        if ($ && $.fn.waypoint) {
          // Reset các element
          $('.ftco-animate').each(function(this: HTMLElement) {
            $(this).removeClass('ftco-animated');
            $(this).css({
              'opacity': 0,
              'visibility': 'hidden'
            });
          });

          // Gắn animation
          $('.ftco-animate').waypoint(
            function(this: { element: HTMLElement }, direction: string) {
              if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
                $(this.element).addClass('item-animate');
                setTimeout(function() {
                  $('.ftco-animate.item-animate').each(function(this: HTMLElement, k: number) {
                    const el = $(this);
                    setTimeout(() => {
                      const effect = el.data('animate-effect');
                      if (effect === 'fadeIn') {
                        el.addClass('fadeIn ftco-animated');
                      } else if (effect === 'fadeInLeft') {
                        el.addClass('fadeInLeft ftco-animated');
                      } else if (effect === 'fadeInRight') {
                        el.addClass('fadeInRight ftco-animated');
                      } else {
                        el.addClass('fadeInUp ftco-animated');
                      }
                      el.removeClass('item-animate');
                    }, k * 50);
                  });
                }, 100);
              }
            },
            { offset: '95%' }
          );
        }
      };

      setTimeout(initAnimations, 1000);
    }
  }, [loading]);
};
