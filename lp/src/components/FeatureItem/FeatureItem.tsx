import {
  component$,
  useSignal,
  useVisibleTask$,
  Slot,
} from "@builder.io/qwik";

interface FeatureItemProps {
  number: string;
  title: string;
  description: string;
  points: string[];
}

/**
 * スクロールで左右からスライドインするFeatureアイテム
 */
export const FeatureItem = component$<FeatureItemProps>(
  ({ number, title, description, points }) => {
    const containerRef = useSignal<HTMLElement>();
    const isVisible = useSignal(false);

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ cleanup }) => {
      const el = containerRef.value;
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              isVisible.value = true;
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );

      observer.observe(el);

      cleanup(() => observer.disconnect());
    });

    return (
      <div class="feature-item" ref={containerRef}>
        <div class={`feature-content ${isVisible.value ? "animate-in" : ""}`}>
          <div class="feature-number">{number}</div>
          <h3 class="feature-title">{title}</h3>
          <p class="feature-description">{description}</p>
          <ul class="feature-points">
            {points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <div class={`feature-visual ${isVisible.value ? "animate-in" : ""}`}>
          <Slot />
        </div>
      </div>
    );
  }
);
