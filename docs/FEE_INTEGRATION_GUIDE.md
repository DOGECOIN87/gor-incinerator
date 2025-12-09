# Fee Integration Guide for Front-End

## Quick Reference

### Fee Recipient Address
```
CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL
```

### Default Fee
**5%** of reclaimed rent

## Front-End Display Recommendations

### 1. Fee Transparency Badge
Display prominently on the landing page:
```tsx
<div className="fee-badge">
  <span>Optional 5% Fee</span>
  <span>Fully Configurable</span>
</div>
```

### 2. Fee Calculator Component
Show users what they'll receive:
```tsx
interface FeeCalculatorProps {
  accountCount: number;
}

const FeeCalculator = ({ accountCount }: FeeCalculatorProps) => {
  const RENT_PER_ACCOUNT = 0.00203928;
  const FEE_PERCENTAGE = 5;
  
  const totalRent = accountCount * RENT_PER_ACCOUNT;
  const feeAmount = (totalRent * FEE_PERCENTAGE) / 100;
  const userReceives = totalRent - feeAmount;
  
  return (
    <div className="fee-breakdown">
      <div>Total Rent: {totalRent.toFixed(6)} GOR</div>
      <div>Fee (5%): {feeAmount.toFixed(6)} GOR</div>
      <div>You Receive: {userReceives.toFixed(6)} GOR</div>
    </div>
  );
};
```

### 3. Configuration Instructions
Add to the setup guide:
```markdown
### Optional: Configure Fees

To disable fees completely, omit the FEE_RECIPIENT from your .env file:
```dotenv
# No fees - you keep 100%
FEE_RECIPIENT=
```

To use the default 5% fee:
```dotenv
FEE_RECIPIENT=CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL
FEE_PERCENTAGE=5
```
```

### 4. FAQ Section
Add these common questions:

**Q: Can I disable the fee?**
A: Yes! Simply omit the `FEE_RECIPIENT` from your .env file and no fees will be collected.

**Q: Where does the fee go?**
A: Fees support the development and maintenance of Gor Incinerator. The recipient address is: `CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL`

**Q: Can I adjust the fee percentage?**
A: Yes! Set `FEE_PERCENTAGE` in your .env file to any value from 0 to 100.

**Q: Is the fee safe?**
A: Absolutely. The fee transfer happens atomically with account closures - it's all or nothing. The code is open source and fully auditable.

## UI/UX Recommendations

### Hero Section Update
Update the stats to reflect the fee:
```tsx
<div className="stats">
  <div>
    <div className="stat-value">5%</div>
    <div className="stat-label">Optional Fee</div>
  </div>
  <div>
    <div className="stat-value">95%</div>
    <div className="stat-label">You Keep</div>
  </div>
</div>
```

### Features Section Update
Add a fee transparency feature card:
```tsx
<Card>
  <CardHeader>
    <div className="icon">💎</div>
    <CardTitle>Transparent Fees</CardTitle>
    <CardDescription>
      Optional 5% fee that can be adjusted or completely disabled. 
      All fees are logged and displayed - no hidden charges.
    </CardDescription>
  </CardHeader>
</Card>
```

### Configuration Step Update
In the "Get Started" section, update step 2:
```tsx
<Card>
  <CardHeader>
    <div className="step-number">2</div>
    <CardTitle>Configure Your Environment</CardTitle>
    <CardDescription>
      Create a .env file with your settings
    </CardDescription>
    <div className="code-block">
      <code>RPC_URL=https://rpc.gorbagana.com</code>
      <code>WALLET=[your,wallet,bytes]</code>
      <code># Optional - Enable 5% fee</code>
      <code>FEE_RECIPIENT=CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL</code>
      <code>FEE_PERCENTAGE=5</code>
    </div>
    <p className="note">
      💡 Tip: Omit FEE_RECIPIENT to keep 100% of reclaimed rent
    </p>
  </CardHeader>
</Card>
```

## Visual Design Suggestions

### Color Scheme for Fee Elements
```css
.fee-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
}

.fee-optional {
  color: #10b981; /* Green to indicate it's optional */
}

.fee-amount {
  color: #f59e0b; /* Amber for fee amounts */
}

.user-receives {
  color: #3b82f6; /* Blue for what user receives */
  font-weight: bold;
}
```

### Icons
- Fee: 💰 or 💎
- Optional: ⚙️ or 🔧
- Transparent: 👁️ or 🔍
- User Control: 🎛️ or ⚡

## Example Output Display

When showing transaction results:
```tsx
<div className="transaction-result">
  <div className="success-message">
    ✅ {accountsClosed} token accounts successfully closed
  </div>
  
  {feeCollected > 0 && (
    <div className="fee-info">
      <div className="fee-collected">
        Fee collected: {feeCollected.toFixed(6)} GOR ({feePercentage}%)
      </div>
      <div className="user-received">
        You received: {userReceived.toFixed(6)} GOR
      </div>
    </div>
  )}
  
  {feeCollected === 0 && (
    <div className="no-fee-info">
      💯 No fees collected - you kept 100%!
    </div>
  )}
</div>
```

## Marketing Copy Suggestions

### Hero Headline Options
1. "Reclaim Your GOR with Optional 5% Fee"
2. "Zero to 5% Fee - You Choose"
3. "Transparent Fee Structure, Maximum Control"

### Value Propositions
- "Unlike other services charging 15%, we offer a configurable 5% fee"
- "Full transparency - see exactly what you pay"
- "Disable fees completely if you prefer"
- "Support development while keeping 95% of your rent"

## Technical Integration

### Environment Variables for Front-End
If building a web interface, expose these settings:
```typescript
interface FeeConfig {
  enabled: boolean;
  recipient: string;
  percentage: number;
}

const defaultFeeConfig: FeeConfig = {
  enabled: true,
  recipient: "CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL",
  percentage: 5
};
```

### API Response Format
If building an API, return fee information:
```typescript
interface BurnResponse {
  success: boolean;
  accountsClosed: number;
  totalRent: number;
  feeCollected: number;
  userReceived: number;
  feePercentage: number;
  signature: string;
}
```

## Compliance & Legal

### Disclosure Text
Add to footer or terms:
```
Fee Disclosure: Gor Incinerator charges an optional 5% fee on 
reclaimed rent to support development and maintenance. This fee 
can be adjusted or disabled by the user. All fees are transparent 
and logged. No hidden charges apply.
```

### User Agreement
```
By using Gor Incinerator with fees enabled, you agree to the 
configured fee percentage being deducted from reclaimed rent 
and transferred to the designated recipient address.
```

## Testing Checklist

- [ ] Fee calculator displays correct amounts
- [ ] Configuration instructions are clear
- [ ] Fee badge is visible on landing page
- [ ] Transaction results show fee breakdown
- [ ] "No fee" mode is clearly explained
- [ ] Fee recipient address is displayed correctly
- [ ] Mobile responsive design for fee elements
- [ ] Accessibility: screen readers can read fee info
- [ ] Dark mode: fee elements are visible
- [ ] Links to fee documentation work

## Support Resources

### Documentation Links
- Main README: `/README.md`
- Fee Implementation: `/FEE_IMPLEMENTATION_SUMMARY.md`
- Configuration Guide: `.env.example`

### Contact for Questions
- GitHub Issues: https://github.com/DOGECOIN87/gor-incinerator.com/issues
- Fee Recipient: CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL

---

**Remember**: The key message is transparency and user control. Users should feel empowered to choose their fee settings, not forced into a specific configuration.
