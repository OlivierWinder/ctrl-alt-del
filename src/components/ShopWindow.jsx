import { useMemo, useState } from 'react';
import Window from './Window';
import { completeCheckout } from '../api/shopify';
import { formatEuros, getOrderTotals, shopProduct } from '../data/shopProduct';
import { assetUrl } from '../utils/assetUrl';

const STEPS = {
  product: 'product',
  checkout: 'checkout',
  confirmed: 'confirmed',
};

const STEP_TITLES = {
  product: 'CD_ROM',
  checkout: 'CHECKOUT',
  confirmed: 'ORDER CONFIRMED',
};

const COUNTRIES = [
  'Netherlands',
  'Belgium',
  'Germany',
  'France',
  'United Kingdom',
  'Other',
];

const EMPTY_FORM = {
  email: '',
  country: 'Netherlands',
  firstName: '',
  lastName: '',
  address: '',
  postcode: '',
  city: '',
  shippingMethod: 'standard',
  paymentMethod: 'credit_card',
};

export default function ShopWindow({
  zIndex,
  containerRef,
  stackOffset = 0,
  onClose,
  onFocus,
  onMetaChange,
}) {
  const [step, setStep] = useState(STEPS.product);
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const totals = useMemo(() => getOrderTotals(quantity), [quantity]);
  const title = STEP_TITLES[step];

  function goTo(nextStep) {
    setError('');
    setStep(nextStep);
    onMetaChange?.({ title: STEP_TITLES[nextStep], shopStep: nextStep });
  }

  function bump(delta) {
    setQuantity((current) => (
      Math.max(1, Math.min(shopProduct.maxQuantity, current + delta))
    ));
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleBack() {
    if (step === STEPS.checkout) goTo(STEPS.product);
    else if (step === STEPS.confirmed) goTo(STEPS.checkout);
  }

  async function handlePay(event) {
    event.preventDefault();
    if (submitting) return;

    if (!form.email.trim() || !form.firstName.trim() || !form.address.trim()) {
      setError('Please fill in email, name, and address.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const result = await completeCheckout({
        quantity: totals.quantity,
        email: form.email.trim(),
        shippingAddress: {
          country: form.country,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          address: form.address.trim(),
          postcode: form.postcode.trim(),
          city: form.city.trim(),
        },
        shippingMethod: form.shippingMethod,
        paymentMethod: form.paymentMethod,
      });
      setOrder(result);
      goTo(STEPS.confirmed);
    } catch (err) {
      setError(err?.message || 'Payment failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Window
      title={title}
      titleIcon={step === STEPS.product ? assetUrl(shopProduct.icon) : undefined}
      variant="shop"
      zIndex={zIndex}
      containerRef={containerRef}
      stackOffset={stackOffset}
      onClose={onClose}
      onFocus={onFocus}
    >
      <div className={`shop-window shop-window--${step}`}>
        <div className="shop-window__stages">
          <div
            className={[
              'shop-window__step',
              'shop-window__step--product',
              step === STEPS.product ? 'is-active' : '',
            ].filter(Boolean).join(' ')}
            aria-hidden={step !== STEPS.product}
          >
            <img
              className="shop-window__hero"
              src={assetUrl(shopProduct.cover)}
              alt=""
              draggable={false}
            />

            <div className="shop-window__product-main">
              <div className="shop-window__product">
                <h2 className="shop-window__title">{shopProduct.title}</h2>
                <p className="shop-window__artist">{shopProduct.artist}</p>
                <p className="shop-window__type">{shopProduct.type}</p>
                <p className="shop-window__price">{formatEuros(shopProduct.priceEuros)}</p>
                <p className="shop-window__shipping-note">{shopProduct.shippingLabel}</p>
              </div>

              <div className="shop-window__qty" aria-label="Quantity">
                <button
                  type="button"
                  className="shop-window__qty-btn"
                  onClick={() => bump(-1)}
                  aria-label="Decrease quantity"
                  tabIndex={step === STEPS.product ? 0 : -1}
                >
                  −
                </button>
                <input
                  className="shop-window__qty-input"
                  type="text"
                  inputMode="numeric"
                  value={quantity}
                  readOnly
                  aria-live="polite"
                  tabIndex={step === STEPS.product ? 0 : -1}
                />
                <button
                  type="button"
                  className="shop-window__qty-btn"
                  onClick={() => bump(1)}
                  aria-label="Increase quantity"
                  tabIndex={step === STEPS.product ? 0 : -1}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="shop-window__cta"
                onClick={() => goTo(STEPS.checkout)}
                tabIndex={step === STEPS.product ? 0 : -1}
              >
                Buy CD
              </button>
            </div>
          </div>

          <form
            className={[
              'shop-window__step',
              'shop-window__step--checkout',
              step === STEPS.checkout ? 'is-active' : '',
            ].filter(Boolean).join(' ')}
            onSubmit={handlePay}
            aria-hidden={step !== STEPS.checkout}
          >
            <button
              type="button"
              className="shop-window__back"
              onClick={handleBack}
              tabIndex={step === STEPS.checkout ? 0 : -1}
            >
              <span className="shop-window__back-arrow" aria-hidden="true">←</span>
              Back to CD_ROM
            </button>

            <div className="shop-checkout__grid">
              <div className="shop-checkout__form">
                <section className="shop-checkout__section">
                  <h3 className="shop-checkout__heading">Contact</h3>
                  <label className="shop-checkout__field">
                    <span className="shop-checkout__label">Email</span>
                    <input
                      className="shop-checkout__input"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) => updateField('email', event.target.value)}
                      tabIndex={step === STEPS.checkout ? 0 : -1}
                    />
                  </label>
                </section>

                <section className="shop-checkout__section">
                  <h3 className="shop-checkout__heading">Delivery</h3>
                  <label className="shop-checkout__field">
                    <span className="shop-checkout__label">Country / Region</span>
                    <select
                      className="shop-checkout__input shop-checkout__input--select"
                      value={form.country}
                      onChange={(event) => updateField('country', event.target.value)}
                      tabIndex={step === STEPS.checkout ? 0 : -1}
                    >
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </label>

                  <div className="shop-checkout__row">
                    <label className="shop-checkout__field">
                      <span className="shop-checkout__label">First name</span>
                      <input
                        className="shop-checkout__input"
                        type="text"
                        autoComplete="given-name"
                        value={form.firstName}
                        onChange={(event) => updateField('firstName', event.target.value)}
                        tabIndex={step === STEPS.checkout ? 0 : -1}
                      />
                    </label>
                    <label className="shop-checkout__field">
                      <span className="shop-checkout__label">Last name</span>
                      <input
                        className="shop-checkout__input"
                        type="text"
                        autoComplete="family-name"
                        value={form.lastName}
                        onChange={(event) => updateField('lastName', event.target.value)}
                        tabIndex={step === STEPS.checkout ? 0 : -1}
                      />
                    </label>
                  </div>

                  <label className="shop-checkout__field">
                    <span className="shop-checkout__label">Address</span>
                    <input
                      className="shop-checkout__input"
                      type="text"
                      autoComplete="street-address"
                      value={form.address}
                      onChange={(event) => updateField('address', event.target.value)}
                      tabIndex={step === STEPS.checkout ? 0 : -1}
                    />
                  </label>

                  <div className="shop-checkout__row">
                    <label className="shop-checkout__field">
                      <span className="shop-checkout__label">Postcode</span>
                      <input
                        className="shop-checkout__input"
                        type="text"
                        autoComplete="postal-code"
                        value={form.postcode}
                        onChange={(event) => updateField('postcode', event.target.value)}
                        tabIndex={step === STEPS.checkout ? 0 : -1}
                      />
                    </label>
                    <label className="shop-checkout__field">
                      <span className="shop-checkout__label">City</span>
                      <input
                        className="shop-checkout__input"
                        type="text"
                        autoComplete="address-level2"
                        value={form.city}
                        onChange={(event) => updateField('city', event.target.value)}
                        tabIndex={step === STEPS.checkout ? 0 : -1}
                      />
                    </label>
                  </div>
                </section>

                <section className="shop-checkout__section">
                  <h3 className="shop-checkout__heading">Shipping</h3>
                  <label className="shop-checkout__choice">
                    <input
                      type="radio"
                      name="shipping"
                      checked={form.shippingMethod === 'standard'}
                      onChange={() => updateField('shippingMethod', 'standard')}
                      tabIndex={step === STEPS.checkout ? 0 : -1}
                    />
                    <span>
                      {shopProduct.shippingMethodLabel}
                      <em>{formatEuros(shopProduct.shippingEuros)}</em>
                    </span>
                  </label>
                </section>

                <section className="shop-checkout__section">
                  <h3 className="shop-checkout__heading">Payment</h3>
                  <label className="shop-checkout__choice">
                    <input
                      type="radio"
                      name="payment"
                      checked={form.paymentMethod === 'credit_card'}
                      onChange={() => updateField('paymentMethod', 'credit_card')}
                      tabIndex={step === STEPS.checkout ? 0 : -1}
                    />
                    <span className="shop-checkout__payment-label">
                      Credit card
                      <span className="shop-checkout__brands" aria-hidden="true">
                        <span className="shop-checkout__brand shop-checkout__brand--visa">VISA</span>
                        <span className="shop-checkout__brand shop-checkout__brand--mc">MC</span>
                        <span className="shop-checkout__brand shop-checkout__brand--amex">AMEX</span>
                      </span>
                    </span>
                  </label>
                </section>
              </div>

              <aside className="shop-checkout__summary">
                <div className="shop-checkout__line-item">
                  <img
                    className="shop-checkout__thumb"
                    src={assetUrl(shopProduct.cover)}
                    alt=""
                    draggable={false}
                  />
                  <div>
                    <div className="shop-checkout__line-title">{shopProduct.title}</div>
                    <div className="shop-checkout__line-meta">
                      {shopProduct.type}
                      {' '}
                      x
                      {totals.quantity}
                    </div>
                  </div>
                </div>

                <div className="shop-checkout__costs">
                  <div className="shop-checkout__cost-row">
                    <span>Subtotal</span>
                    <span>{formatEuros(totals.subtotal)}</span>
                  </div>
                  <div className="shop-checkout__cost-row">
                    <span>Shipping</span>
                    <span>{formatEuros(totals.shipping)}</span>
                  </div>
                  <div className="shop-checkout__cost-row shop-checkout__cost-row--total">
                    <span>Total</span>
                    <span>{formatEuros(totals.total)}</span>
                  </div>
                </div>
              </aside>
            </div>

            {error ? <p className="shop-window__error">{error}</p> : null}

            <button
              type="submit"
              className="shop-window__cta"
              disabled={submitting}
              tabIndex={step === STEPS.checkout ? 0 : -1}
            >
              {submitting ? 'Processing…' : 'Pay now'}
            </button>
          </form>

          <div
            className={[
              'shop-window__step',
              'shop-window__step--confirmed',
              step === STEPS.confirmed ? 'is-active' : '',
            ].filter(Boolean).join(' ')}
            aria-hidden={step !== STEPS.confirmed}
          >
            <button
              type="button"
              className="shop-window__back"
              onClick={handleBack}
              tabIndex={step === STEPS.confirmed ? 0 : -1}
            >
              <span className="shop-window__back-arrow" aria-hidden="true">←</span>
              Back to checkout
            </button>

            <div className="shop-confirmed__hero">
              <div className="shop-confirmed__check" aria-hidden="true">✓</div>
              <h2 className="shop-confirmed__title">Order confirmed</h2>
              <p className="shop-confirmed__thanks">Thank you.</p>
              <p className="shop-confirmed__order">
                {order?.orderName || '#1001'}
              </p>
            </div>

            <div className="shop-confirmed__summary">
              <div className="shop-checkout__line-item">
                <img
                  className="shop-checkout__thumb"
                  src={assetUrl(shopProduct.cover)}
                  alt=""
                  draggable={false}
                />
                <div className="shop-confirmed__summary-text">
                  <div className="shop-checkout__line-title">{shopProduct.title}</div>
                  <div className="shop-checkout__line-meta">
                    {shopProduct.type}
                    {' '}
                    x
                    {order?.totals?.quantity ?? totals.quantity}
                  </div>
                </div>
                <div className="shop-confirmed__price">
                  {formatEuros(order?.totals?.total ?? totals.total)}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="shop-window__cta shop-window__cta--muted"
              onClick={onClose}
              tabIndex={step === STEPS.confirmed ? 0 : -1}
            >
              Return to CTRL-ALT-DEL
            </button>
          </div>
        </div>
      </div>
    </Window>
  );
}
