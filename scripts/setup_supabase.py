import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add parent directory to path so backend imports work
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR / "backend"))

load_dotenv(ROOT_DIR / "backend" / ".env")
load_dotenv(ROOT_DIR / "frontend" / ".env.local")

from app.core.config import settings
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text


async def run_setup():
    print("==================================================")
    print("[+] Supabase Database Automatic Setup via Python")
    print("==================================================")

    db_url = settings.get_database_url

    schema_file = ROOT_DIR / "supabase" / "schema.sql"
    if not schema_file.exists():
        print(f"[-] Schema file not found at {schema_file}")
        return

    sql_script = schema_file.read_text(encoding="utf-8")

    print(f"\n[+] Connecting to Supabase Database at {settings.host}...")

    # Method 1: Try psycopg2 if available
    try:
        import psycopg2
        print("[+] Connecting using psycopg2 driver...")
        conn = psycopg2.connect(
            dbname=settings.dbname,
            user=settings.user,
            password=settings.password,
            host=settings.host,
            port=settings.port,
            sslmode="require"
        )
        conn.autocommit = True
        with conn.cursor() as cur:
            print("[+] Executing schema.sql script on Supabase...")
            cur.execute(sql_script)
            print("[SUCCESS] All tables, enums, triggers, views, RLS policies, and seed data created successfully!")

            cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
            tables = [row[0] for row in cur.fetchall()]
            print(f"\n[+] Public Tables in Supabase Database: {tables}")
            
            cur.execute("SELECT count(*) FROM public.campaigns;")
            count = cur.fetchone()[0]
            print(f"[SUCCESS] Active Campaigns found in database: {count}")
        conn.close()
        return
    except ImportError:
        print("[+] psycopg2 not installed, falling back to asyncpg raw execution...")
    except Exception as e:
        print(f"[-] psycopg2 attempt notice: {e}. Trying asyncpg raw connection...")

    # Method 2: Asyncpg raw connection
    engine = create_async_engine(
        db_url,
        echo=False,
        connect_args={
            "prepared_statement_cache_size": 0,
            "statement_cache_size": 0,
        }
    )

    try:
        async with engine.connect() as conn:
            raw_conn = await conn.stream_raw_connection() if hasattr(conn, "stream_raw_connection") else await conn.raw_connection()
            asyncpg_conn = raw_conn.driver_connection
            print("[+] Executing schema.sql via raw asyncpg connection...")
            await asyncpg_conn.execute(sql_script)
            print("[SUCCESS] All tables, enums, triggers, views, RLS policies, and seed data created successfully!")

            result = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"))
            tables = [row[0] for row in result.fetchall()]
            print(f"\n[+] Public Tables in Supabase Database: {tables}")
            
            camp_result = await conn.execute(text("SELECT count(*) FROM public.campaigns;"))
            count = camp_result.scalar()
            print(f"[SUCCESS] Active Campaigns found in database: {count}")

    except Exception as e:
        print(f"\n[-] Error setting up database: {e}")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(run_setup())



