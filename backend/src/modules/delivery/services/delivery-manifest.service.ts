import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../../orders/schemas/order.schema';
import { DELIVERY_PROVIDER_LABELS, DeliveryProviderId } from '../enums/delivery-provider.enum';
import { DeliveryManifestDto } from '../dto/delivery-manifest.dto';
import { Shipment, ShipmentDocument } from '../schemas/shipment.schema';

const ACTIVE_STATUSES = ['created', 'in_transit', 'out_for_delivery', 'pending_pickup'];

@Injectable()
export class DeliveryManifestService {
  constructor(
    @InjectModel(Shipment.name) private shipmentModel: Model<ShipmentDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async getManifest(
    tenantId: string,
    provider: DeliveryProviderId,
    format: 'json' | 'html' = 'json',
  ): Promise<DeliveryManifestDto> {
    const tenant = new Types.ObjectId(tenantId);
    const shipments = await this.shipmentModel
      .find({ tenantId: tenant, provider, status: { $in: ACTIVE_STATUSES } })
      .sort({ createdAt: 1 })
      .lean();

    const orderIds = shipments.map((s) => s.orderId).filter(Boolean) as Types.ObjectId[];
    const orders = orderIds.length
      ? await this.orderModel.find({ _id: { $in: orderIds }, tenantId: tenant }).lean()
      : [];
    const orderMap = new Map(orders.map((o) => [o._id.toString(), o]));

    const items = shipments.map((s, i) => {
      const order = s.orderId ? orderMap.get(s.orderId.toString()) : undefined;
      const addr = order?.shippingAddress;
      const customerName = addr
        ? `${addr.firstName || ''} ${addr.lastName || ''}`.trim()
        : '—';
      const codAmount =
        order?.paymentMethod === 'cod'
          ? Number((order as { amountToCollect?: number }).amountToCollect ?? order.total ?? 0)
          : 0;

      return {
        index: i + 1,
        trackingNumber: s.trackingNumber,
        orderNumber: s.orderNumber || order?.orderNumber,
        customerName: customerName || '—',
        phone: addr?.phone || '—',
        address: addr ? [addr.address1, addr.city, addr.province].filter(Boolean).join(', ') : '—',
        codAmount,
        status: s.status,
      };
    });

    const manifest: DeliveryManifestDto = {
      provider,
      providerLabel: DELIVERY_PROVIDER_LABELS[provider] || provider,
      generatedAt: new Date().toISOString(),
      summary: {
        parcels: items.length,
        codParcels: items.filter((i) => i.codAmount > 0).length,
        codTotal: items.reduce((sum, i) => sum + i.codAmount, 0),
      },
      items,
    };

    if (format === 'html') {
      manifest.html = this.buildHtml(manifest);
    }

    return manifest;
  }

  private buildHtml(manifest: DeliveryManifestDto): string {
    const rows = manifest.items
      .map(
        (it) => `<tr>
          <td>${it.index}</td>
          <td>${escapeHtml(it.trackingNumber)}</td>
          <td>${escapeHtml(it.orderNumber || '—')}</td>
          <td>${escapeHtml(it.customerName)}</td>
          <td>${escapeHtml(it.phone)}</td>
          <td>${escapeHtml(it.address)}</td>
          <td style="text-align:right">${it.codAmount > 0 ? `${it.codAmount.toFixed(2)} TND` : '—'}</td>
          <td style="width:80px"></td>
        </tr>`,
      )
      .join('');

    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"/>
      <title>Bordereau ${escapeHtml(manifest.providerLabel)}</title>
      <style>
        body{font-family:Arial,sans-serif;margin:24px;color:#111}
        h1{font-size:18px;margin:0 0 4px}
        .meta{font-size:12px;color:#555;margin-bottom:16px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;vertical-align:top}
        th{background:#f3f4f6}
        .summary{margin:12px 0;font-size:13px;font-weight:bold}
        .sign{margin-top:32px;font-size:12px;display:flex;justify-content:space-between}
        @media print{button{display:none}}
      </style></head><body>
      <h1>Bordereau transporteur — ${escapeHtml(manifest.providerLabel)}</h1>
      <div class="meta">Généré le ${new Date(manifest.generatedAt).toLocaleString('fr-FR')}</div>
      <div class="summary">
        ${manifest.summary.parcels} colis · ${manifest.summary.codParcels} en COD ·
        Total COD : ${manifest.summary.codTotal.toFixed(2)} TND
      </div>
      <table>
        <thead><tr>
          <th>#</th><th>Tracking</th><th>Commande</th><th>Client</th>
          <th>Téléphone</th><th>Adresse</th><th style="text-align:right">COD</th><th>Émargement</th>
        </tr></thead>
        <tbody>${rows || '<tr><td colspan="8">Aucun colis actif</td></tr>'}</tbody>
      </table>
      <div class="sign">
        <span>Signature commerçant : ____________________</span>
        <span>Signature transporteur : ____________________</span>
      </div>
      <button onclick="window.print()" style="margin-top:24px;padding:8px 16px">Imprimer</button>
    </body></html>`;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
