#!/usr/bin/env python3
"""Send a bounded number of concurrent GET requests to a local Laravel API."""

from __future__ import annotations

import argparse
import asyncio
import ipaddress
import json
import os
import re
import statistics
import subprocess
import sys
import time
import uuid
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

DEFAULT_URL = "http://127.0.0.1:8001/api/categories"
PROJECT_DIR = Path(__file__).resolve().parents[1]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Test de charge local, limité et en lecture seule (routes GET uniquement)."
    )
    parser.add_argument("--url", default=DEFAULT_URL, help=f"URL locale de l’API (défaut: {DEFAULT_URL})")
    parser.add_argument("--requests", type=int, default=1000, help="Nombre total de requêtes (maximum: 10000)")
    parser.add_argument("--concurrency", type=int, default=25, help="Requêtes simultanées (maximum: 100)")
    parser.add_argument("--timeout", type=float, default=10.0, help="Timeout par requête en secondes")
    parser.add_argument("--method", choices=["GET", "POST"], default="GET", help="Méthode HTTP (POST vise une seule route)" )
    parser.add_argument("--json-body", help="Corps JSON à envoyer en POST")
    parser.add_argument("--bearer-token-env", help="Nom de la variable d’environnement qui contient le jeton API")
    parser.add_argument("--confirm-write", action="store_true", help="Confirmer l’envoi répété de requêtes POST")
    parser.add_argument("--all-get-routes", action="store_true", help="Parcourir toutes les routes GET de Laravel")
    parser.add_argument("--expected-status", type=int, default=200, help="Code attendu en mode URL unique")
    args = parser.parse_args()

    if not 1 <= args.requests <= 10_000:
        parser.error("--requests doit être compris entre 1 et 10000")
    if not 1 <= args.concurrency <= 100:
        parser.error("--concurrency doit être compris entre 1 et 100")
    if args.timeout <= 0:
        parser.error("--timeout doit être supérieur à 0")
    if args.method == "POST":
        if not args.confirm_write:
            parser.error("POST écrit potentiellement des données; ajoute --confirm-write après avoir choisi une route locale de test")
        if args.all_get_routes:
            parser.error("--all-get-routes ne s’applique qu’aux requêtes GET")
        if args.requests > 1000 or args.concurrency > 10:
            parser.error("Pour POST, les limites sont 1000 requêtes et 10 simultanées")
        if args.json_body is None:
            parser.error("POST nécessite --json-body avec les données de la route")
        try:
            body = json.loads(args.json_body)
        except json.JSONDecodeError as error:
            parser.error(f"--json-body doit contenir du JSON valide: {error}")
        parsed_path = urlsplit(args.url).path.rstrip("/")
        if parsed_path.endswith("/api/payments/cinetpay/verify"):
            reference = body.get("reference") if isinstance(body, dict) else None
            if not isinstance(reference, str) or not reference.startswith("LOAD_TEST_"):
                parser.error("Pour protéger CinetPay, cette route exige une référence inexistante commençant par LOAD_TEST_")
    elif args.json_body is not None or args.confirm_write:
        parser.error("--json-body et --confirm-write s’utilisent uniquement avec --method POST")

    parsed = urlsplit(args.url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        parser.error("--url doit être une URL HTTP(S) valide")
    hostname = parsed.hostname.lower()
    is_loopback = hostname == "localhost"
    try:
        is_loopback = is_loopback or ipaddress.ip_address(hostname).is_loopback
    except ValueError:
        pass
    if not is_loopback:
        parser.error("La cible doit être localhost ou une adresse IP loopback")

    return args


def discover_get_routes(api_base: str) -> list[str]:
    try:
        result = subprocess.run(
            ["php", "artisan", "route:list", "--json", "--path=api"],
            cwd=PROJECT_DIR,
            check=True,
            capture_output=True,
            text=True,
        )
    except (OSError, subprocess.CalledProcessError) as error:
        detail = getattr(error, "stderr", "") or str(error)
        raise RuntimeError(f"Impossible de lire les routes Laravel: {detail.strip()}") from error

    routes = json.loads(result.stdout)
    paths: set[str] = set()
    for route in routes:
        methods = route.get("method", "").split("|")
        uri = route.get("uri", "")
        if "GET" not in methods or not uri.startswith("api/"):
            continue
        # Use a harmless placeholder for required and optional route parameters.
        uri = re.sub(r"\{([^}/?]+)\??\}", "1", uri)
        paths.add(f"{api_base}/{uri}")
    if not paths:
        raise RuntimeError("Aucune route GET /api trouvée.")
    return sorted(paths)


class NoRedirectHandler(HTTPRedirectHandler):
    def redirect_request(self, request, file, code, message, headers, new_url):
        return None


def send_request(url: str, timeout: float, method: str, body: bytes | None, bearer_token: str | None) -> tuple[int | None, float, str | None]:
    started = time.perf_counter()
    headers = {"User-Agent": "e-commerce-local-load-test/1.0"}
    if body is not None:
        headers["Content-Type"] = "application/json"
        headers["Accept"] = "application/json"
    if bearer_token:
        headers["Authorization"] = f"Bearer {bearer_token}"
    request = Request(url, data=body, headers=headers, method=method)
    try:
        with build_opener(NoRedirectHandler).open(request, timeout=timeout) as response:
            response.read(1024)
            return response.status, time.perf_counter() - started, None
    except HTTPError as error:
        error.read(1024)
        return error.code, time.perf_counter() - started, None
    except (URLError, TimeoutError, OSError) as error:
        return None, time.perf_counter() - started, str(error)


async def run() -> int:
    args = parse_args()
    parsed = urlsplit(args.url)
    if args.all_get_routes:
        api_base = f"{parsed.scheme}://{parsed.netloc}"
        try:
            urls = discover_get_routes(api_base)
        except (RuntimeError, json.JSONDecodeError) as error:
            print(f"Erreur: {error}", file=sys.stderr)
            return 2
    else:
        urls = [args.url]
    request_body = args.json_body.encode("utf-8") if args.method == "POST" else None
    bearer_token = os.environ.get(args.bearer_token_env) if args.bearer_token_env else None
    if args.bearer_token_env and not bearer_token:
        print(f"Erreur: la variable {args.bearer_token_env} est vide ou absente.", file=sys.stderr)
        return 2

    loop = asyncio.get_running_loop()
    loop.set_default_executor(ThreadPoolExecutor(max_workers=args.concurrency))
    queue: asyncio.Queue[int] = asyncio.Queue()
    for request_id in range(args.requests):
        queue.put_nowait(request_id)

    statuses: Counter[int] = Counter()
    route_statuses: dict[str, Counter[int]] = {}
    failures: Counter[str] = Counter()
    latencies: list[float] = []

    async def worker() -> None:
        while True:
            try:
                request_id = queue.get_nowait()
            except asyncio.QueueEmpty:
                return
            url = urls[request_id % len(urls)]
            body = request_body
            if args.method == "POST" and urlsplit(url).path.rstrip("/").endswith("/api/payments/cinetpay/verify"):
                payload = json.loads(args.json_body)
                payload["reference"] = f"LOAD_TEST_{request_id}_{uuid.uuid4().hex}"
                body = json.dumps(payload).encode("utf-8")
            status, elapsed, error = await asyncio.to_thread(
                send_request, url, args.timeout, args.method, body, bearer_token
            )
            latencies.append(elapsed)
            if status is None:
                failures[f"{url}: {error or 'Erreur réseau'}"] += 1
            else:
                statuses[status] += 1
                route_statuses.setdefault(url, Counter())[status] += 1
            queue.task_done()

    started = time.perf_counter()
    await asyncio.gather(*(worker() for _ in range(min(args.concurrency, args.requests))))
    elapsed = time.perf_counter() - started
    completed = sum(statuses.values()) + sum(failures.values())
    server_errors = sum(count for code, count in statuses.items() if code >= 500)
    if args.all_get_routes:
        passed = completed == args.requests and server_errors == 0 and not failures
    elif args.method == "POST":
        passed = completed == args.requests and statuses[args.expected_status] == args.requests and not failures
    else:
        passed = completed == args.requests and statuses[args.expected_status] == args.requests and not failures

    print(f"Mode        : {'toutes les routes GET API' if args.all_get_routes else f'{args.method} sur une route'}")
    print(f"Routes GET  : {len(urls)}" if args.all_get_routes else f"Cible       : {args.url}")
    print(f"Résultat    : {args.requests} requêtes, concurrence {args.concurrency}")
    print(f"HTTP        : {', '.join(f'{code}={count}' for code, count in sorted(statuses.items())) or 'aucune réponse'}")
    if args.all_get_routes:
        print(f"Erreurs 5xx : {server_errors} (les réponses 401/403/404 et 429 sont affichées, pas traitées comme des pannes serveur)")
        for url, counts in sorted(route_statuses.items()):
            if any(code >= 500 for code in counts):
                print(f"  5xx {', '.join(f'{code}={count}' for code, count in sorted(counts.items()))} {url}")
    if failures:
        print(f"Erreurs réseau: {sum(failures.values())} ({'; '.join(f'{count}× {error}' for error, count in failures.most_common(3))})")
    if latencies:
        ordered = sorted(latencies)
        p95 = ordered[min(len(ordered) - 1, int(len(ordered) * 0.95))]
        print(
            f"Latence     : médiane {statistics.median(ordered) * 1000:.0f} ms, "
            f"p95 {p95 * 1000:.0f} ms, max {max(ordered) * 1000:.0f} ms"
        )
    print(f"Débit       : {completed / elapsed:.1f} req/s sur {elapsed:.2f} s")
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(run()))
