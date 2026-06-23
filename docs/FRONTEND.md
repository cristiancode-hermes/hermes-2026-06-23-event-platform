# Frontend Architecture

## Signal Strategy

All component state uses Angular signals with zoneless change detection.

### Pattern
```typescript
// Local state
const items = signal<Item[]>([]);
const loading = signal(true);
const error = signal<string | null>(null);

// Derived state
const isEmpty = computed(() => !loading() && items().length === 0);
const filteredItems = computed(() => filterItems(items(), searchQuery()));
```

### Template Pattern
```html
@if (loading()) {
  <app-skeleton-card [count]="6" />
} @else if (error()) {
  <app-error-state [message]="error()" (retry)="loadItems()" />
} @else if (isEmpty()) {
  <app-empty-state title="No items" message="..." actionLabel="Create" (action)="create()" />
} @else {
  @for (item of items(); track item.id) {
    <app-event-card [event]="item" />
  }
}
```

## Multi-Step Wizard Pattern

```typescript
const currentStep = signal(1);
const isLastStep = computed(() => currentStep() === totalSteps);
const canGoNext = computed(() => isStepValid(currentStep()));

function next(): void { if (canGoNext()) currentStep.update(s => s + 1); }
function back(): void { currentStep.update(s => s - 1); }
```

## Shared Components

| Component | Purpose |
|-----------|---------|
| EventCardComponent | Event card with image, title, date, price |
| CapacityBarComponent | Progress bar with dynamic color (green/amber/red) |
| FormFieldComponent | Reusable input with label and error message |
| LoadingButtonComponent | Button with loading spinner state |
| EmptyStateComponent | Empty state with icon and CTA |
| ErrorStateComponent | Error state with retry button |
| SkeletonCardComponent | Loading skeleton with shimmer |
| ModalComponent | Generic modal with overlay |
| ConfirmDialogComponent | Confirmation dialog |
| ToastComponent | Toast notification |
| EventStatusBadgeComponent | Status pill (active/draft/completed) |
| PriceBadgeComponent | Price display (free→green, paid→accent) |
