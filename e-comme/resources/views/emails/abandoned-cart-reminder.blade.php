<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;background:#f5f5f2;color:#202522;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:620px;margin:32px auto;padding:0 16px">
    <div style="background:#fff;padding:36px 32px;border:1px solid #e7e7e1">
      <p style="margin:0;color:#17645e;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Naya · Votre boutique</p>
      <h1 style="margin:20px 0 12px;font-family:Georgia,serif;font-size:30px;font-weight:normal">Bonjour {{ $customerName }},</h1>
      <p style="margin:0;color:#555d58;font-size:15px;line-height:1.7">Vous avez laissé quelques articles dans votre panier. Ils vous attendent encore, mais les disponibilités peuvent évoluer.</p>
      <div style="margin:24px 0;border-top:1px solid #ecece8">
        @foreach($items as $item)
          <div style="padding:14px 0;border-bottom:1px solid #ecece8;font-size:14px">
            <strong>{{ $item->product?->name ?? 'Article' }}</strong>
            <span style="float:right;color:#69736d">Quantité : {{ $item->quantity }}</span>
          </div>
        @endforeach
      </div>
      <a href="{{ $cartUrl }}" style="display:inline-block;margin-top:8px;padding:14px 22px;background:#173f3b;color:#fff;text-decoration:none;font-size:13px;font-weight:bold">Retrouver mon panier</a>
      <p style="margin:26px 0 0;color:#7a817c;font-size:12px;line-height:1.6">Si vous avez déjà finalisé votre commande, ignorez simplement ce message.</p>
    </div>
  </div>
</body>
</html>
